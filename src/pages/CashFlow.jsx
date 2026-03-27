import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useOutletContext } from 'react-router-dom';

const CashFlow = () => {
  const { transactions, calcTotals } = useAppContext();
  const { formatMoney } = useOutletContext();
  
  const t = calcTotals(transactions);

  const exportCSV = () => {
    if(!transactions.length) { alert('No transactions to export.'); return; }
    // Add logic here from ledger if needed, or link to ledger
  };

  const cats = {};
  transactions.forEach(tx => {
    if (!cats[tx.cat]) cats[tx.cat] = { in: 0, out: 0 };
    if (tx.type === 'income') cats[tx.cat].in += Number(tx.amount);
    else cats[tx.cat].out += Number(tx.amount);
  });

  return (
    <div className="page on">
      <div className="topbar">
        <div>
          <div className="page-title">Cash Flow</div>
          <div className="page-sub">Track where your money comes from and goes</div>
        </div>
      </div>

      <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat">
          <div className="stat-lbl">Cash Inflow</div>
          <div className="stat-val up">{formatMoney(t.income)}</div>
          <div className="stat-note">All income received</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Cash Outflow</div>
          <div className="stat-val dn">{formatMoney(t.expense)}</div>
          <div className="stat-note">All expenses paid</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Net Flow</div>
          <div className={`stat-val \${t.net >= 0 ? 'up' : 'dn'}`}>{formatMoney(t.net)}</div>
          <div className="stat-note">Inflow − Outflow</div>
        </div>
      </div>

      <div className="split-card" style={{ marginBottom: 16 }}>
        <div className="split-head"><span className="split-title">Cash vs Digital Breakdown</span></div>
        <div className="split-body">
          <div className="split-half">
            <div className="split-half-label"><span className="cash-dot"></span>Physical Cash</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>In hand, collected in cash</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>Cash Income</span><span className="mono net-positive">+{formatMoney(t.cashIn)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>Cash Expenses</span><span className="mono net-negative">-{formatMoney(t.cashOut)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', fontWeight: 600 }}>
              <span>Cash Net</span><span className={`mono \${t.cashNet >= 0 ? 'net-positive' : 'net-negative'}`}>{formatMoney(t.cashNet)}</span>
            </div>
          </div>
          <div className="split-half">
            <div className="split-half-label"><span className="dig-dot"></span>Digital Money</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>UPI, bank transfer, card</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>Digital Income</span><span className="mono net-positive">+{formatMoney(t.digIn)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13 }}>Digital Expenses</span><span className="mono net-negative">-{formatMoney(t.digOut)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', fontWeight: 600 }}>
              <span>Digital Net</span><span className={`mono \${t.digNet >= 0 ? 'net-positive' : 'net-negative'}`}>{formatMoney(t.digNet)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-head"><span style={{ fontSize: 14, fontWeight: 600 }}>Cash Flow by Category</span></div>
        <div>
          {Object.entries(cats).length > 0 ? Object.entries(cats).map(([cat, v]) => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{cat}</span>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                {v.in > 0 && <span className="mono net-positive" style={{ fontSize: 12 }}>+{formatMoney(v.in)}</span>}
                {v.out > 0 && <span className="mono net-negative" style={{ fontSize: 12 }}>-{formatMoney(v.out)}</span>}
              </div>
            </div>
          )) : (
            <div className="empty">
              <div className="empty-icon">📊</div>
              <div className="empty-txt">No data yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashFlow;
