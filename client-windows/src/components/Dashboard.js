import React, { useState } from 'react';
import ServiceStatus from './ServiceStatus';

function Dashboard({ deviceInfo, screenTimeInfo, serviceStatus }) {
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleLogout = () => {
    if (window.electronAPI) {
      window.electronAPI.logout();
    }
  };

  const getDailyLimitPercentage = () => {
    if (!screenTimeInfo) return 0;
    return (screenTimeInfo.total / screenTimeInfo.limit) * 100;
  };

  const formatMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Parental Control - Child Device</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {notificationMessage && (
          <div className="notification">{notificationMessage}</div>
        )}

        {deviceInfo && (
          <div className="device-card">
            <h2>Device Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Device Name:</span>
                <span>{deviceInfo.device_name}</span>
              </div>
              <div className="info-item">
                <span className="label">OS:</span>
                <span>{deviceInfo.os} {deviceInfo.os_version}</span>
              </div>
              <div className="info-item">
                <span className="label">Device ID:</span>
                <span className="mono">{deviceInfo.device_id}</span>
              </div>
            </div>
          </div>
        )}

        {screenTimeInfo && (
          <div className="screen-time-card">
            <h2>Screen Time Today</h2>
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(getDailyLimitPercentage(), 100)}%`,
                    backgroundColor:
                      getDailyLimitPercentage() > 80 ? '#ff6b6b' : '#51cf66',
                  }}
                />
              </div>
              <div className="time-display">
                <span className="used">
                  {formatMinutes(screenTimeInfo.total)} used
                </span>
                <span className="limit">
                  / {formatMinutes(screenTimeInfo.limit)} limit
                </span>
              </div>
              {screenTimeInfo.remaining !== undefined && (
                <div className="remaining">
                  <span>
                    {screenTimeInfo.remaining > 0
                      ? `${formatMinutes(screenTimeInfo.remaining)} remaining`
                      : 'Limit reached'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <ServiceStatus serviceStatus={serviceStatus} />

        <div className="restrictions-card">
          <h2>Restrictions Active</h2>
          <ul className="restrictions-list">
            <li>✓ Chrome monitoring enabled</li>
            <li>✓ Website filtering active</li>
            <li>✓ Screen time tracking enabled</li>
            <li>✓ Safe search enabled</li>
          </ul>
        </div>

        <div className="info-card">
          <h2>About Parental Control</h2>
          <p>
            This device is being monitored to ensure your safety online. Your
            parents can:
          </p>
          <ul>
            <li>Monitor your browsing activity</li>
            <li>Block inappropriate websites</li>
            <li>Limit your daily screen time</li>
            <li>Lock your screen when needed</li>
          </ul>
          <p>
            If you believe a website has been blocked in error, please speak to
            your parents.
          </p>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>Last synced: {new Date().toLocaleTimeString()}</p>
      </footer>
    </div>
  );
}

export default Dashboard;
