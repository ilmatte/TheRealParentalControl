import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Login({ onLoginSuccess, onSwitchToRegister }) {
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${serverUrl}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_id', response.data.user.id);

      if (window.electronAPI?.saveServiceConfig) {
        const res = await window.electronAPI.saveServiceConfig({
          serverUrl,
          authToken: response.data.token,
          authEmail: email,
          authPassword: password,
          userId: response.data.user.id,
        });
        if (!res || res.success === false) {
          const cfgPath = res?.configPath || 'unknown location';
          setError(
            `Failed to save service settings: ${res?.error || 'permission denied'}. Run the installer as administrator or grant write access to ${cfgPath}`
          );
          setIsLoading(false);
          return;
        }
      }

      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Parental Control</h1>
        <form onSubmit={handleLogin}>
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
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="info-text">
          This is a monitored device. Your parents can control your browsing.
        </p>
        <p className="info-text">
          Don’t have an account yet?{' '}
          <button className="link-button" type="button" onClick={onSwitchToRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
