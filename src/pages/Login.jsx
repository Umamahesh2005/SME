import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let authError;

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
      if (!error) {
        alert('Signup successful! You can now log in.');
        setIsLogin(true);
      }
    }

    if (authError) {
      setError(authError.message);
    } else if (isLogin) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card glass">
        <div className="login-header">
          <div className="stat-icon net" style={{margin: '0 auto 1rem'}}><DollarSign size={24} /></div>
          <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="text-muted">SME Financial Management Platform</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="owner@company.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn" style={{width: '100%', justifyContent: 'center'}} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Secure Log In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-switch">
          <button className="text-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
