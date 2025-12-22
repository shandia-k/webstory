import React, { useState, useEffect } from 'react';
import { ShieldAlert, XCircle, ExternalLink } from 'lucide-react';

interface TabGuardProps {
    children: React.ReactNode;
}

const TabGuard: React.FC<TabGuardProps> = ({ children }) => {
    const [isDuplicate, setIsDuplicate] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const channel = new BroadcastChannel('pal_game_lock');
        let isMaster = false;

        // 1. Listen for messages
        channel.onmessage = (event) => {
            if (event.data === 'PING') {
                if (isMaster) {
                    channel.postMessage('PONG');
                }
            } else if (event.data === 'PONG') {
                setIsDuplicate(true);
                setChecking(false);
            }
        };

        // 2. Ping to check for other tabs
        channel.postMessage('PING');

        // 3. Timeout to decide if we are the master
        const timer = setTimeout(() => {
            if (!isDuplicate) {
                isMaster = true;
                setChecking(false);
            }
        }, 500);

        return () => {
            channel.close();
            clearTimeout(timer);
        };
    }, [isDuplicate]);

    if (checking) {
        return (
            <div className="fixed inset-0 bg-white flex items-center justify-center z-[1000]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <p className="text-gray-400 font-medium">Checking connection...</p>
                </div>
            </div>
        );
    }

    if (isDuplicate) {
        return (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-3xl flex items-center justify-center z-[1000] p-6">
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-md w-full shadow-2xl border-4 border-white flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                        <ShieldAlert size={40} />
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 mb-4 leading-tight">
                        Game Sudah Terbuka!
                    </h1>

                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Maaf, game ini hanya bisa dibuka di <b>satu tab</b> saja untuk menjaga keamanan data kamu. Silakan gunakan tab yang sudah ada.
                    </p>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => window.close()}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <XCircle size={20} />
                            Tutup Tab Ini
                        </button>
                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">
                            Atau refresh tab utama kamu
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default TabGuard;
