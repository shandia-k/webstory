import React, { useEffect, useRef } from 'react';

interface NarrativeLogProps {
    logs: string[];
}

const NarrativeLog: React.FC<NarrativeLogProps> = ({ logs }) => {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="w-full h-32 bg-gray-900/80 backdrop-blur-md rounded-xl p-4 overflow-y-auto mb-4 border border-gray-700 shadow-inner hide-scrollbar">
            <div className="flex flex-col gap-2">
                {logs.map((log, i) => (
                    <p key={i} className="text-sm font-medium text-gray-200 animate-in fade-in slide-in-from-left-2">
                        {log.includes('YOU:') ? (
                            <span className="text-yellow-400 font-bold">{log}</span>
                        ) : log.includes('HIT!') ? (
                            <span className="text-red-400 font-bold">{log}</span>
                        ) : (
                            <span>{log}</span>
                        )}
                    </p>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
};

export default NarrativeLog;
