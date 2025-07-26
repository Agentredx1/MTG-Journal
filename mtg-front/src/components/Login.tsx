import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [passkey, setPasskey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey.trim()) return;

    setIsSubmitting(true);
    const success = await login(passkey.trim());
    if (!success) {
      setPasskey('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>MTG Journal</h1>
        <p>Enter your group passkey to access your game data</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="passkey">Group Passkey</label>
            <input
              id="passkey"
              type="text"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter your passkey"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={!passkey.trim() || isSubmitting}
            className="login-button"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;