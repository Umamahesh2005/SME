import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const INCOME_CATS = ['Sales Revenue','Service Income','Consulting Fee','Commission','Rent Income','Interest Received','Loan Received','Investment','Advance Received','Other Income'];
export const EXPENSE_CATS = ['Salaries & Wages','Office Rent','Raw Materials','Utilities','Marketing & Ads','Transportation','Equipment','Repairs & Maintenance','Legal & Professional','Insurance','Loan Repayment','Taxes','Petty Cash','Office Supplies','Food & Entertainment','Other Expense'];

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState('owner');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setRole('owner');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      // Fetch Profile
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile) setRole(profile.role);

      // Fetch Transactions
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false }).order('created_at', { ascending: false });
      if (txData) setTransactions(txData);

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const addTransaction = async (entry) => {
    if (!user) return null;
    const newTx = { ...entry, user_id: user.id };
    const { data, error } = await supabase.from('transactions').insert([newTx]).select().single();
    if (data) {
      setTransactions(prev => [data, ...prev].sort((a,b) => new Date(b.date) - new Date(a.date)));
      return data;
    } else {
      console.error(error);
      alert("Error adding transaction: " + error.message);
      return null;
    }
  };

  const updateTransaction = async (id, updatedData) => {
    if (!user) return null;
    const { data, error } = await supabase.from('transactions').update(updatedData).eq('id', id).select().single();
    if (data) {
      setTransactions(prev => prev.map(t => t.id === id ? data : t).sort((a,b) => new Date(b.date) - new Date(a.date)));
      return data;
    } else {
      console.error(error);
      alert("Error updating transaction: " + error.message);
      return null;
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    } else {
      console.error(error);
      alert("Error deleting transaction: " + error.message);
    }
  };

  // Helper to quickly calculate sums for views
  const calcTotals = (list = transactions) => {
    const income = list.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    const cashIn = list.filter(t => t.type === 'income' && t.payment === 'cash').reduce((s, t) => s + Number(t.amount), 0);
    const digIn = list.filter(t => t.type === 'income' && t.payment === 'digital').reduce((s, t) => s + Number(t.amount), 0);
    const cashOut = list.filter(t => t.type === 'expense' && t.payment === 'cash').reduce((s, t) => s + Number(t.amount), 0);
    const digOut = list.filter(t => t.type === 'expense' && t.payment === 'digital').reduce((s, t) => s + Number(t.amount), 0);
    
    return {
      income, expense, net: income - expense,
      cashIn, digIn, cashOut, digOut,
      cashNet: cashIn - cashOut,
      digNet: digIn - digOut
    };
  };

  return (
    <AppContext.Provider value={{ 
      role, 
      transactions,
      addTransaction, updateTransaction, deleteTransaction,
      calcTotals,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
