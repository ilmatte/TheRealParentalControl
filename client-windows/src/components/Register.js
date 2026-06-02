import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState(
    process.env.REACT_APP_SERVER_URL || 'http://localhost:5000'
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      if (window.electronAPI?.loadServiceConfig) {
        const config = await window.electronAPI.loadServiceConfig();
        if (config?.serverUrl) {
          setServerUrl(config.serverUrl);
        }
      }
    };
    loadConfig();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${serverUrl}/api/auth/register`, {
        email,
        password,
        username,
        role: 'child',
      });

      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_id', response.data.user.id);

      if (window.electronAPI?.saveServiceConfig) {
        await window.electronAPI.saveServiceConfig({
          serverUrl,
          authToken: response.data.token,
          authEmail: email,
          authPassword: password,
          userId: response.data.user.id,
        });
      }

      onRegisterSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Create Child Account</h1>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Backend URL</label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              required
              placeholder="https://parental-control-api-xxxx.onrender.com"
            />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Child Name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="child@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="info-text">
          Already have an account?{' '}
          <button className="link-button" onClick={onSwitchToLogin}>
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
