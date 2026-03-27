import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import AIVoiceAssistant from '../components/AIVoiceAssistant';
import TransactionModal from '../components/TransactionModal';

const MainLayout = () => {
  const { signOut } = useAuth();
  const { transactions, calcTotals } = useAppContext();
  const navigate = useNavigate();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('income');
  const [modalPayment, setModalPayment] = useState('cash');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const openAdd = (type = 'income', payment = 'cash') => {
    setModalType(type);
    setModalPayment(payment);
    setModalOpen(true);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { name: 'Full Ledger', path: '/ledger', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { name: 'Record Income', path: '/income', isAction: true,
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
    { name: 'Record Expense', path: '#', isAction: true, isExpense: true,
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
    { name: 'Cash Flow', path: '/cash-flow', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg> },
    { name: 'P&L Summary', path: '/summary', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }
  ];

  const t = calcTotals(transactions);
  
  const formatMoney = (val) => {
    const sign = val < 0 ? '-' : '';
    return sign + '₹' + Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="app-container">
      {/* Sidebar for Desktop */}
      <div className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-row">
            <div className="sb-icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
            <div><div className="sb-title">FlowSME</div><div className="sb-sub">Money Tracker</div></div>
          </div>
        </div>
        
        <div className="sb-section">Main</div>
        <NavLink to="/dashboard" className={({ isActive }) => `sb-item \${isActive ? 'active' : ''}`}>
          {navItems[0].icon} Dashboard
        </NavLink>
        <NavLink to="/ledger" className={({ isActive }) => `sb-item \${isActive ? 'active' : ''}`}>
          {navItems[1].icon} Full Ledger
        </NavLink>

        <div className="sb-section">Track Money</div>
        <NavLink to="/income" className={({ isActive }) => `sb-item \${isActive ? 'active' : ''}`} onClick={() => openAdd('income')}>
          {navItems[2].icon} Money In
        </NavLink>
        <div className="sb-item" onClick={() => { navigate('/ledger'); openAdd('expense'); }}>
          {navItems[3].icon} Money Out
        </div>

        <div className="sb-section">Reports</div>
        <NavLink to="/cash-flow" className={({ isActive }) => `sb-item \${isActive ? 'active' : ''}`}>
          {navItems[4].icon} Cash Flow
        </NavLink>
        <NavLink to="/summary" className={({ isActive }) => `sb-item \${isActive ? 'active' : ''}`}>
          {navItems[5].icon} P&L Summary
        </NavLink>

        <div className="sb-foot">
          <div className="sb-item" onClick={handleLogout} style={{color: 'var(--r3)'}}>
             Sign Out
          </div>
          <div className="sb-bal">
            <div className="sb-bal-label">Net Balance</div>
            <div className="sb-bal-val" style={{color: t.net >= 0 ? '#fff' : '#f08080'}}>{formatMoney(t.net)}</div>
            <div className="sb-bal-sub">Cash + Digital</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        <Outlet context={{ openAdd, formatMoney }} />
      </div>

      {/* Bottom Nav for Mobile */}
      <div className="bottom-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `bottom-nav-item \${isActive ? 'active' : ''}`}>
          {navItems[0].icon}<span>Dash</span>
        </NavLink>
        <NavLink to="/ledger" className={({ isActive }) => `bottom-nav-item \${isActive ? 'active' : ''}`}>
          {navItems[1].icon}<span>Ledger</span>
        </NavLink>
        <div className="bottom-nav-item" onClick={() => openAdd('income', 'cash')}>
          {navItems[2].icon}<span>Income</span>
        </div>
        <div className="bottom-nav-item" onClick={() => openAdd('expense', 'cash')}>
          {navItems[3].icon}<span>Expense</span>
        </div>
      </div>

      <AIVoiceAssistant />
      <TransactionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        initialType={modalType} 
        initialPayment={modalPayment} 
      />
    </div>
  );
};

export default MainLayout;
