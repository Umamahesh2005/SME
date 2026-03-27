import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Dashboard = () => {
  const { transactions, calcTotals } = useAppContext();
  const { openAdd, formatMoney } = useOutletContext();
  const navigate = useNavigate();

  const t = calcTotals(transactions);
  const recent = transactions.slice(0, 8);

  const renderRow = (tx) => {
    const isIncome = tx.type === 'income';
    const isCash = tx.payment === 'cash';
    const sign = isIncome ? '+' : '-';
    const color = isIncome ? 'var(--g6)' : 'var(--r5)';
    const icon = isIncome ? (isCash ? '💵' : '💳') : (isCash ? '💸' : '💳');
    const bg = isIncome ? 'background:#edfaf3' : 'background:#fef0f0';
    
    return (
      <div className="ledger-row" key={tx.id} onClick={() => navigate('/ledger')}>
        <div className="lr-type" style={{background: isIncome ? '#edfaf3' : '#fef0f0'}}>
          {icon}
        </div>
        <div className="lr-info">
          <div className="lr-title">{tx.desc}</div>
          <div className="lr-meta">
            <span className={`badge \${isCash ? 'b-cash' : 'b-digital'}`}>{isCash ? 'Cash' : 'Digital'}</span>
            <span>{tx.cat}</span>
            {tx.party && <span>· {tx.party}</span>}
            <span>· {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
        <div>
          <div className="lr-amount" style={{ color }}>{sign}{formatMoney(tx.amount)}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="page on">
      <div className="topbar">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Live financial overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-cash" onClick={() => openAdd('income', 'cash')}>💵 Money In (Cash)</button>
          <button className="btn btn-digital" onClick={() => openAdd('income', 'digital')}>💳 Money In (Digital)</button>
          <button className="btn btn-red btn-sm" onClick={() => openAdd('expense', 'digital')}>− Money Out</button>
        </div>
      </div>

      <div className="stats" id="dash-stats">
        <div className="stat">
          <div className="stat-ico" style={{background:'#edfaf3'}}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{stroke:'var(--g6)'}}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
          <div className="stat-lbl">Total Income</div>
          <div className="stat-val up">{formatMoney(t.income)}</div>
          <div className="stat-note"><span>{transactions.filter(x => x.type === 'income').length} entries</span></div>
        </div>
        <div className="stat">
          <div className="stat-ico" style={{background:'#fef0f0'}}><svg viewBox="0 0 24 24" style={{stroke:'var(--r5)'}}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg></div>
          <div className="stat-lbl">Total Expenses</div>
          <div className="stat-val dn">{formatMoney(t.expense)}</div>
          <div className="stat-note"><span>{transactions.filter(x => x.type === 'expense').length} entries</span></div>
        </div>
        <div className="stat">
          <div className="stat-ico" style={{background:'#fff4d4'}}><svg viewBox="0 0 24 24" style={{stroke:'#b87a12'}}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/></svg></div>
          <div className="stat-lbl">Cash Balance</div>
          <div className="stat-val" style={{color: t.cashNet >= 0 ? '#a86000' : 'var(--r5)'}}>{formatMoney(t.cashNet)}</div>
          <div className="stat-note">Physical cash</div>
        </div>
        <div className="stat">
          <div className="stat-ico" style={{background:'var(--b1)'}}><svg viewBox="0 0 24 24" style={{stroke:'var(--b6)'}}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>
          <div className="stat-lbl">Digital Balance</div>
          <div className="stat-val" style={{color: t.digNet >= 0 ? 'var(--b6)' : 'var(--r5)'}}>{formatMoney(t.digNet)}</div>
          <div className="stat-note">UPI / Bank / Card</div>
        </div>
      </div>

      <div className="cash-reg">
        <div className="cr-title">Live Money Tracker</div>
        <div className="cr-grid">
          <div className="cr-item">
            <div className="cr-item-label"><span>💵</span> Cash In Hand</div>
            <div className="cr-item-val">{formatMoney(t.cashNet)}</div>
            <div className="cr-item-sub">In: {formatMoney(t.cashIn)} | Out: {formatMoney(t.cashOut)}</div>
          </div>
          <div className="cr-item">
            <div className="cr-item-label"><span>💳</span> Digital Wallet</div>
            <div className="cr-item-val">{formatMoney(t.digNet)}</div>
            <div className="cr-item-sub">In: {formatMoney(t.digIn)} | Out: {formatMoney(t.digOut)}</div>
          </div>
          <div className="cr-item">
            <div className="cr-item-label"><span>📊</span> Net Profit</div>
            <div className="cr-item-val" style={{color: t.net >= 0 ? 'var(--g4)' : 'var(--r5)'}}>{formatMoney(t.net)}</div>
            <div className="cr-item-sub">{t.net >= 0 ? 'Profitable' : 'Loss'}</div>
          </div>
        </div>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-head">
          <span style={{fontSize:14, fontWeight:600}}>Recent Transactions</span>
          <button className="btn btn-out btn-sm" onClick={() => navigate('/ledger')}>View all →</button>
        </div>
        <div>
          {recent.length > 0 ? recent.map(renderRow) : (
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-txt">No transactions yet. Record your first income or expense!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
