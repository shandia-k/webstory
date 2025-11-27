import React from 'react';

export default function LeftPanel({ avatar, stats, status }) {
    return (
        <div className="panel">
            <div className="avatar-placeholder" id="avatar-icon">{avatar}</div>
            <h3>Character Stats</h3>
            <div id="dynamic-stats">
                {Object.entries(stats).map(([key, val]) => (
                    <div className="stat-row" key={key}>
                        <div className="stat-label"><span>{key}</span> <span>{val}%</span></div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${val}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 style={{ marginTop: '20px' }}>Conditions</h3>
            <div className="status-effects">
                {status.map((s, i) => (
                    <span className="status-tag" key={i}>{s}</span>
                ))}
            </div>
        </div>
    );
}
