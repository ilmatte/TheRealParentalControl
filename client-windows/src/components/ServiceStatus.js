import React from 'react';

function ServiceStatus({ serviceStatus }) {
  if (!serviceStatus) {
    return (
      <div className="service-status-card">
        <h2>Service Configuration</h2>
        <p>The Windows service configuration has not been saved yet.</p>
        <p>Complete login or registration to persist the service settings for startup.</p>
      </div>
    );
  }

  return (
    <div className="service-status-card">
      <h2>Service Configuration Saved</h2>
      <div className="info-grid">
        <div className="info-item">
          <span className="label">Backend URL:</span>
          <span>{serviceStatus.serverUrl}</span>
        </div>
        <div className="info-item">
          <span className="label">User ID:</span>
          <span>{serviceStatus.userId || 'N/A'}</span>
        </div>
        <div className="info-item">
          <span className="label">Saved at:</span>
          <span>
            {serviceStatus.savedAt ? new Date(serviceStatus.savedAt).toLocaleString() : 'Unknown'}
          </span>
        </div>
        <div className="info-item">
          <span className="label">Config file:</span>
          <span>{serviceStatus.configPath || 'Unknown'}</span>
        </div>
      </div>
      <p>The service can now read this configuration at startup.</p>
    </div>
  );
}

export default ServiceStatus;
