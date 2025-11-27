import React from 'react';

export default function RightPanel({ items, quest, onInspect }) {
    return (
        <div className="panel">
            <h3>Inventory</h3>
            <div className="inventory-grid">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="inv-item"
                        onClick={() => onInspect(item)}
                    >
                        <div className="item-icon">{item.icon}</div>
                        <div className="item-name">{item.name}</div>

                        <div className="tooltip">
                            <strong>{item.name}</strong><br />
                            <span style={{ fontSize: '0.9em', opacity: 0.8 }}>{item.desc}</span>
                            <div style={{ marginTop: '6px' }}>
                                {item.tags.map((tag, i) => (
                                    <span key={i} className="tag-pill">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 style={{ marginTop: '20px' }}>Current Objective</h3>
            <div>
                {quest}
            </div>
        </div>
    );
}
