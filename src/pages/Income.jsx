import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Income = () => {
  const { transactions, calcTotals, deleteTransaction } = useAppContext();
  const { openAdd, formatMoney } = useOutletContext();

  const inc = transactions.filter(t => t.type === 'income');
  const t = calcTotals(inc);
  const total = t.cashIn + t.digIn;
  const cashPct = total ? (t.cashIn / total) * 100 : 0;
  const digPct = total ? (t.digIn / total) * 100 : 0;

  const renderRow = (tx) => {
    const isCash = tx.payment === 'cash';
    return (
      <div className="ledger-row" key={tx.id}>
        <div className="lr-type" style={{background: '#edfaf3'}}>
          {isCash ? '💵' : '💳'}
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
          <div className="lr-amount" style={{ color: 'var(--g6)' }}>+{formatMoney(tx.amount)}</div>
          <div style={{textAlign:'right', marginTop:2}}>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteTransaction(tx.id); }} 
              style={{fontSize:10, color:'var(--muted)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--font)', padding:'2px 4px', borderRadius:4}}
            >
              ✕ delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page on">
      <div className="topbar">
        <div>
          <div className="page-title">Money In</div>
          <div className="page-sub">Track every rupee you receive</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-cash" onClick={() => openAdd('income', 'cash')}>💵 Money In (Cash)</button>
          <button className="btn btn-digital" onClick={() => openAdd('income', 'digital')}>💳 Money In (Digital)</button>
        </div>
      </div>

      <div className="split-card">
        <div className="split-head"><span className="split-title">Income Breakdown</span></div>
        <div className="split-body">
          <div className="split-half">
            <div className="split-half-label"><span className="cash-dot"></span>Cash Income</div>
            <div style={{fontFamily:'var(--mono)', fontSize:26, fontWeight:700, color:'#a86000', marginBottom:6}}>
              {formatMoney(t.cashIn)}
            </div>
            <div style={{fontSize:12, color:'var(--muted)'}}>{inc.filter(x=>x.payment==='cash').length} transactions</div>
            <div className="prog" style={{marginTop:10}}>
              <div className="prog-fill" style={{background:'#e6a817', width: `\${cashPct}%`}}></div>
            </div>
          </div>
          <div className="split-half">
            <div className="split-half-label"><span className="dig-dot"></span>Digital Income</div>
            <div style={{fontFamily:'var(--mono)', fontSize:26, fontWeight:700, color:'var(--b6)', marginBottom:6}}>
              {formatMoney(t.digIn)}
            </div>
            <div style={{fontSize:12, color:'var(--muted)'}}>{inc.filter(x=>x.payment==='digital').length} transactions</div>
            <div className="prog" style={{marginTop:10}}>
              <div className="prog-fill" style={{background:'var(--b6)', width: `\${digPct}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-head"><span style={{fontSize:14, fontWeight:600}}>Income Transactions</span></div>
        <div>
          {inc.length > 0 ? inc.map(renderRow) : (
            <div className="empty">
              <div className="empty-icon">💰</div>
              <div className="empty-txt">No income recorded yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Income;
