import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [screenTimeInfo, setScreenTimeInfo] = useState(null);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);

  const loadServiceStatus = async () => {
    if (window.electronAPI?.loadServiceConfig) {
      const config = await window.electronAPI.loadServiceConfig();
      setServiceStatus(config);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsLoggedIn(true);
      loadDeviceInfo();
      loadServiceStatus();
    }

    // Listen for logout events
    if (window.electronAPI) {
      window.electronAPI.onUserLoggedOut(() => {
        setIsLoggedIn(false);
        localStorage.removeItem('auth_token');
      });
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    // Update screen time every 10 seconds
    const interval = setInterval(async () => {
      if (window.electronAPI) {
        try {
          const screenTime = await window.electronAPI.getScreenTime();
          setScreenTimeInfo(screenTime);
        } catch (error) {
          console.error('Failed to get screen time:', error);
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !window.electronAPI) return;

    // Listen for screen time updates
    window.electronAPI.onScreenTimeUpdate((event, data) => {
      setScreenTimeInfo(data);
    });

    // Listen for website blocked notifications
    window.electronAPI.onWebsiteBlocked((event, data) => {
      showNotification('Website Blocked', `${data.url} is blocked`);
    });

    // Listen for screen lock
    window.electronAPI.onScreenLocked((event, data) => {
      showNotification('Screen Locked', data.reason);
    });
  }, [isLoggedIn]);

  const loadDeviceInfo = async () => {
    if (!window.electronAPI) return;
    try {
      const info = await window.electronAPI.getDeviceInfo();
      setDeviceInfo(info);
    } catch (error) {
      console.error('Failed to load device info:', error);
    }
  };

  const showNotification = (title, message) => {
    // Show notification in the dashboard
    console.log(`${title}: ${message}`);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    loadDeviceInfo();
    loadServiceStatus();
  };

  const toggleForm = () => {
    setShowRegister((prev) => !prev);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        showRegister ? (
          <Register onRegisterSuccess={handleLogin} onSwitchToLogin={toggleForm} />
        ) : (
          <Login onLoginSuccess={handleLogin} onSwitchToRegister={toggleForm} />
        )
      ) : (
        <Dashboard
          deviceInfo={deviceInfo}
          screenTimeInfo={screenTimeInfo}
          serviceStatus={serviceStatus}
        />
      )}
    </div>
  );
}

export default App;
