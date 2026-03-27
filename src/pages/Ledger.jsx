import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAppContext, INCOME_CATS, EXPENSE_CATS } from '../context/AppContext';

const Ledger = () => {
  const { transactions, calcTotals, deleteTransaction } = useAppContext();
  const { openAdd, formatMoney } = useOutletContext();
  
  const [searchTxt, setSearchTxt] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPay, setFilterPay] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = transactions.filter(t => {
    if (filterType && t.type !== filterType) return false;
    if (filterPay && t.payment !== filterPay) return false;
    if (filterCat && t.cat !== filterCat) return false;
    if (searchTxt) {
      const q = searchTxt.toLowerCase();
      if (!t.desc.toLowerCase().includes(q) && !t.cat.toLowerCase().includes(q) && 
         (!t.party || !t.party.toLowerCase().includes(q))) {
        return false;
      }
    }
    return true;
  });

  const tot = calcTotals(filtered);
  const allCats = [...new Set(transactions.map(t => t.cat).filter(Boolean))];

  const exportCSV = () => {
    if(!filtered.length) { alert('No transactions to export.'); return; }
    const rows = [['Date','Type','Payment','Amount','Description','Category','Party','Reference','Notes']];
    filtered.forEach(t => rows.push([t.date, t.type, t.payment, t.amount, t.desc, t.cat, t.party || '', t.ref || '', t.notes || '']));
    const csv = rows.map(r => r.map(c => `"\${String(c).replace(/"/g,'""')}"`).join(',')).join('\\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `flowsme_ledger_\${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderRow = (tx) => {
    const isIncome = tx.type === 'income';
    const isCash = tx.payment === 'cash';
    const sign = isIncome ? '+' : '-';
    const color = isIncome ? 'var(--g6)' : 'var(--r5)';
    const icon = isIncome ? (isCash ? '💵' : '💳') : (isCash ? '💸' : '💳');
    
    return (
      <div className="ledger-row" key={tx.id}>
        <div className="lr-type" style={{background: isIncome ? '#edfaf3' : '#fef0f0'}}>
          {icon}
        </div>
        <div className="lr-info">
          <div className="lr-title">{tx.desc}</div>
          <div className="lr-meta">
            <span className={`badge \${isCash ? 'b-cash' : 'b-digital'}`}>{isCash ? 'Cash' : 'Digital'}</span>
            <span>{tx.cat}</span>
            {tx.party && <span>· {tx.party}</span>}
            {tx.ref && <span>· {tx.ref}</span>}
            <span>· {new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
        <div>
          <div className="lr-amount" style={{ color }}>{sign}{formatMoney(tx.amount)}</div>
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
          <div className="page-title">Full Ledger</div>
          <div className="page-sub">Every rupee in & out — cash and digital</div>
        </div>
        <div className="topbar-right">
          <button className="btn btn-green" onClick={() => openAdd('income', 'digital')}>+ Money In</button>
          <button className="btn btn-red" onClick={() => openAdd('expense', 'digital')}>− Money Out</button>
        </div>
      </div>

      <div className="filter-row">
        <input type="text" placeholder="🔍 Search..." style={{width:200}} value={searchTxt} onChange={e => setSearchTxt(e.target.value)} />
        <select style={{width:130}} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          <option value="income">Money In Only</option>
          <option value="expense">Money Out Only</option>
        </select>
        <select style={{width:130}} value={filterPay} onChange={e => setFilterPay(e.target.value)}>
          <option value="">All Payment</option>
          <option value="cash">Cash Only</option>
          <option value="digital">Digital Only</option>
        </select>
        <select style={{width:150}} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn btn-out btn-sm" onClick={exportCSV}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      <div className="summary-bar">
        <div className="sum-item"><div className="sum-lbl">Total In</div><div className="sum-val net-positive">{formatMoney(tot.income)}</div></div>
        <div className="sum-div"></div>
        <div className="sum-item"><div className="sum-lbl">Total Out</div><div className="sum-val net-negative">{formatMoney(tot.expense)}</div></div>
        <div className="sum-div"></div>
        <div className="sum-item"><div className="sum-lbl">Net Balance</div><div className={`sum-val \${tot.net >= 0 ? 'net-positive' : 'net-negative'}`}>{formatMoney(tot.net)}</div></div>
      </div>

      <div className="tbl-wrap">
        <div>
          {filtered.length > 0 ? filtered.map(renderRow) : (
            <div className="empty">
              <div className="empty-icon">📒</div>
              <div className="empty-txt">No matching transactions</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;
