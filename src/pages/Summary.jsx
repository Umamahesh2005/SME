import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useOutletContext } from 'react-router-dom';

const Summary = () => {
  const { transactions, calcTotals } = useAppContext();
  const { formatMoney } = useOutletContext();

  const t = calcTotals(transactions);

  const cats = {};
  transactions.forEach(tx => {
    if (!cats[tx.cat]) cats[tx.cat] = { in: 0, out: 0, type: tx.type };
    if (tx.type === 'income') cats[tx.cat].in += Number(tx.amount);
    else cats[tx.cat].out += Number(tx.amount);
  });

  return (
    <div className="page on">
      <div className="topbar">
        <div>
          <div className="page-title">Profit & Loss Summary</div>
          <div className="page-sub">Your complete financial picture</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--r2)', border: '1px solid var(--border)', padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Net Profit / Loss</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 42, fontWeight: 700, color: t.net >= 0 ? 'var(--g7)' : 'var(--r5)' }}>
            {formatMoney(t.net)}
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
            <span style={{ color: 'var(--muted)' }}>Total Money In</span><span className="mono net-positive">+{formatMoney(t.income)}</span>
          </div>
          <div style={{ padding: '8px 0 4px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Income breakdown</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 8px 12px', borderBottom: '1px solid #f5f5f5' }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>💵 Cash income</span><span className="mono" style={{ fontSize: 13 }}>{formatMoney(t.cashIn)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 16px 12px', borderBottom: '1px solid #f5f5f5' }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>💳 Digital income</span><span className="mono" style={{ fontSize: 13 }}>{formatMoney(t.digIn)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5', marginTop: 4 }}>
            <span style={{ color: 'var(--muted)' }}>Total Money Out</span><span className="mono net-negative">-{formatMoney(t.expense)}</span>
          </div>
          <div style={{ padding: '8px 0 4px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Expense breakdown</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 8px 12px', borderBottom: '1px solid #f5f5f5' }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>💵 Cash expenses</span><span className="mono" style={{ fontSize: 13 }}>{formatMoney(t.cashOut)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 16px 12px', borderBottom: '2px solid var(--border)' }}>
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>💳 Digital expenses</span><span className="mono" style={{ fontSize: 13 }}>{formatMoney(t.digOut)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontWeight: 700, fontSize: 16 }}>
            <span>Net Profit / Loss</span><span className={`mono \${t.net >= 0 ? 'net-positive' : 'net-negative'}`}>{formatMoney(t.net)}</span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
        {Object.entries(cats).map(([cat, v]) => (
          <div key={cat} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{cat}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{transactions.filter(x => x.cat === cat).length} transactions</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {v.in > 0 && <div className="mono net-positive" style={{ fontSize: 13 }}>+{formatMoney(v.in)}</div>}
              {v.out > 0 && <div className="mono net-negative" style={{ fontSize: 13 }}>-{formatMoney(v.out)}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
