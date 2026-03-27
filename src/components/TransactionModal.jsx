import React, { useState, useEffect } from 'react';
import { useAppContext, INCOME_CATS, EXPENSE_CATS } from '../context/AppContext';

const CAT_ICONS = {
  // Income
  'Sales Revenue': '💰', 'Service Income': '🛠️', 'Consulting Fee': '🧠', 'Commission': '📈', 
  'Rent Income': '🏠', 'Interest Received': '🏦', 'Loan Received': '💵', 'Investment': '💎', 
  'Advance Received': '📑', 'Other Income': '✨',
  // Expense
  'Salaries & Wages': '👥', 'Office Rent': '🏢', 'Raw Materials': '📦', 'Utilities': '⚡', 
  'Marketing & Ads': '📢', 'Transportation': '🚚', 'Equipment': '🔧', 'Repairs & Maintenance': '🛠️', 
  'Legal & Professional': '⚖️', 'Insurance': '🛡️', 'Loan Repayment': '🏦', 'Taxes': '🏛️', 
  'Petty Cash': '👛', 'Office Supplies': '🖇️', 'Food & Entertainment': '🍱', 'Other Expense': '🐚'
};

const TransactionModal = ({ isOpen, onClose, initialType = 'income', initialPayment = 'cash', editTxn = null }) => {
  const { addTransaction, updateTransaction } = useAppContext();
  
  const [type, setType] = useState(initialType);
  const [payment, setPayment] = useState(initialPayment);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('');
  const [party, setParty] = useState('');
  const [ref, setRef] = useState('');
  const [notes, setNotes] = useState('');
  
  const [showMore, setShowMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editTxn) {
        setType(editTxn.type); setPayment(editTxn.payment); setAmount(editTxn.amount);
        setDate(editTxn.date); setDesc(editTxn.desc); setCat(editTxn.cat);
        setParty(editTxn.party || ''); setRef(editTxn.ref || ''); setNotes(editTxn.notes || '');
        setShowMore(true);
      } else {
        setType(initialType); setPayment(initialPayment); setAmount('');
        setDate(new Date().toISOString().split('T')[0]); setDesc(''); setCat('');
        setParty(''); setRef(''); setNotes(''); setShowMore(false);
      }
      setErrorMsg('');
    }
  }, [isOpen, initialType, initialPayment, editTxn]);

  if (!isOpen) return null;

  const cats = type === 'income' ? INCOME_CATS : EXPENSE_CATS;

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) { setErrorMsg('⚠ Please enter an amount'); return; }
    if (!cat) { setErrorMsg('⚠ Please pick what this is for (Category)'); return; }
    
    // Auto-description if empty
    const finalDesc = desc || cat;

    const entry = {
      type, payment, amount: Number(amount), desc: finalDesc, cat,
      party: party.trim(), ref: ref.trim(), notes: notes.trim(), date
    };

    const result = editTxn ? await updateTransaction(editTxn.id, entry) : await addTransaction(entry);
    if (result) onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') onClose(); }}>
      <div className="modal-content" style={{maxWidth: 480}}>
        <div className="modal-top" style={{borderBottom:'none'}}>
          <div className="modal-title" style={{fontSize: 20, fontWeight: 800}}>
            {type === 'income' ? '🟢 Money In' : '🔴 Money Out'}
          </div>
          <button className="modal-x" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{paddingTop: 0}}>
          <div className="type-toggle" style={{marginBottom: 20}}>
            <button className={`type-btn ${type === 'income' ? 'on' : ''}`} style={{background: type === 'income' ? 'var(--g6)' : '#fff'}} onClick={() => setType('income')}>Money In</button>
            <button className={`type-btn ${type === 'expense' ? 'on' : ''}`} style={{background: type === 'expense' ? 'var(--r5)' : '#fff'}} onClick={() => setType('expense')}>Money Out</button>
          </div>

          <div className="fg" style={{marginBottom: 24}}>
            <label className="fl" style={{textAlign:'center', display:'block', fontSize: 13}}>How much money?</label>
            <input 
              type="number" 
              className="amount-input-large"
              placeholder="0.00" 
              autoFocus
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div className="fl" style={{ marginBottom: 8 }}>How did you get/pay it?</div>
            <div className="pay-toggle" style={{margin:0}}>
              <button className={`pay-opt ${payment === 'cash' ? 'cash-on' : ''}`} onClick={() => setPayment('cash')}>💵 In Hand (Cash)</button>
              <button className={`pay-opt ${payment === 'digital' ? 'dig-on' : ''}`} onClick={() => setPayment('digital')}>💳 Online / Bank</button>
            </div>
          </div>

          <div className="fg">
            <label className="fl">What is this for?</label>
            <div className="cat-grid">
              {cats.map(c => (
                <div 
                  key={c} 
                  className={`cat-btn ${cat === c ? 'selected' : ''}`} 
                  onClick={() => setCat(c)}
                >
                  <span className="cat-icon">{CAT_ICONS[c] || '📦'}</span>
                  <span className="cat-label">{c}</span>
                </div>
              ))}
            </div>
          </div>

          {!showMore && (
            <button className="more-details-toggle" onClick={() => setShowMore(true)}>
              + Add more details (Name, Bill No, Notes)
            </button>
          )}

          {showMore && (
            <div style={{marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)'}}>
               <div className="fg">
                <label className="fl">Small Note / Description</label>
                <input type="text" placeholder="e.g. Paid to shop..." value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
              
              <div className="row2">
                <div className="fg">
                  <label className="fl">Name (Client/Vendor)</label>
                  <input type="text" placeholder="Name" value={party} onChange={e => setParty(e.target.value)} />
                </div>
                <div className="fg">
                  <label className="fl">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
              </div>

              <div className="row2">
                <div className="fg">
                  <label className="fl">Reference / Invoice #</label>
                  <input type="text" placeholder="Bill No." value={ref} onChange={e => setRef(e.target.value)} />
                </div>
                <div className="fg">
                  <label className="fl">Extra Notes</label>
                  <input type="text" placeholder="..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {errorMsg && <div className="alert al-red" style={{marginTop: 16}}>{errorMsg}</div>}
        </div>

        <div className="modal-foot">
          <button className="btn btn-out" onClick={onClose}>Cancel</button>
          <button 
            className={`btn ${type === 'income' ? 'btn-money-in' : 'btn-money-out'}`} 
            onClick={handleSave}
            style={{padding: '12px 24px', fontSize: 15, fontWeight: 700}}
          >
            {editTxn ? 'Update' : 'Save'} {type === 'income' ? 'Inward' : 'Outward'}
          </button>
        </div>
      </div>
    </div>
  );
};


export default TransactionModal;
