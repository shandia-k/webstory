import React from 'react';

export default function LeftPanel({ avatar, stats, status, items, onInspect, quest }) {
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

            <h3 style={{ marginTop: '20px' }}>Inventory</h3>
            <div className="inventory-grid">
                {items && items.length > 0 ? (
                    items.map((item, i) => (
                        <div key={i} className="inventory-item" onClick={() => onInspect(item)}>
                            {item.name}
                        </div>
                    ))
                ) : (
                    <div style={{ color: '#666', fontStyle: 'italic' }}>Empty</div>
                )}
            </div>

            {quest && (
                <div className="quest-box" style={{ marginTop: '20px', padding: '10px', border: '1px solid #444', borderRadius: '4px', background: 'rgba(0,0,0,0.2)' }}>
                    <h3 style={{ margin: '0 0 5px 0', border: 'none', fontSize: '0.8em', color: '#ffd700' }}>Current Objective</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{quest.title}</p>
                </div>
            )}
        </div>
    );
}
