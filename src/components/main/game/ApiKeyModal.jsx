import React, { useState, useEffect } from 'react';
import { Key, Save, X, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Shield, CheckCircle2, Globe } from 'lucide-react';
import { testApiKey, translateUiSubset, getUiBatches } from '../../../services/llmService';
import { useGame } from '../../../context/GameContext';
import { TRANSLATIONS } from '../../../constants/textUI';

export function ApiKeyModal({ isOpen, onClose, onSave }) {
    const { uiText, updateUiText } = useGame();
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [language, setLanguage] = useState('English');
    const [testStatus, setTestStatus] = useState('idle'); // idle, testing, success, error
    const [testMessage, setTestMessage] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const savedKey = localStorage.getItem('nexus_api_key');
            const savedLang = localStorage.getItem('nexus_language');
            if (savedKey) setKey(savedKey);
            if (savedLang) setLanguage(savedLang);
            setTestStatus('idle');
            setTestMessage('');
            setIsTranslating(false);
        }
    }, [isOpen]);

    const handleTest = async () => {
        if (!key.trim()) {
            setTestStatus('error');
            setTestMessage(uiText.UI.API_MODAL.ERR_EMPTY);
            return;
        }

        setTestStatus('testing');
        setTestMessage(uiText.UI.API_MODAL.STATUS_TESTING);

        try {
            await testApiKey(key.trim(), language);
            setTestStatus('success');
            setTestMessage(uiText.UI.API_MODAL.STATUS_SUCCESS);
        } catch (error) {
            setTestStatus('error');
            setTestMessage(error.message);
        }
    };

    const handleSave = async () => {
        if (!key.trim()) return;

        const trimmedKey = key.trim();
        const trimmedLang = language.trim();

        // Check if translation is needed
        const isPredefined = Object.keys(TRANSLATIONS).some(k => k.toLowerCase() === trimmedLang.toLowerCase());

        if (!isPredefined) {
            setIsTranslating(true);
            try {
                // 1. Get Batches
                const { critical, secondary } = getUiBatches(TRANSLATIONS['English']);

                // 2. Translate Critical Batch (Blocking)
                const criticalTranslated = await translateUiSubset(trimmedKey, trimmedLang, critical);

                // 3. Update UI with Critical Translations (keep secondary in English for now)
                const initialUI = { ...TRANSLATIONS['English'], ...criticalTranslated };
                updateUiText(trimmedLang, initialUI);

                // 4. Save & Close immediately
                localStorage.setItem('nexus_api_key', trimmedKey);
                localStorage.setItem('nexus_language', trimmedLang);
                onSave(trimmedKey, trimmedLang);
                onClose();

                // Background translation removed in favor of Smart Lazy Loading

                return; // Exit function as we handled close manually

            } catch (error) {
                console.error("Translation Failed", error);
                setTestStatus('error');
                setTestMessage("Translation failed. UI will remain English.");
                setIsTranslating(false);
                return;
            }
        }

        localStorage.setItem('nexus_api_key', trimmedKey);
        localStorage.setItem('nexus_language', trimmedLang);
        onSave(trimmedKey, trimmedLang);
        onClose();
    };

    const isLanguageEnabled = testStatus === 'success';

    // ANIMATION: We removed the conditionally return null to allow exit animations.
    // Instead we toggle classes.

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 visible backdrop-blur-sm bg-black/20' : 'opacity-0 invisible backdrop-blur-none bg-black/0 pointer-events-none'}`}>
            <div className={`bg-white/95 backdrop-blur-xl border-4 border-white/50 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative overflow-hidden ring-4 ring-black/5 transition-all duration-300 ease-out delay-75 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-800 transition-colors z-20 hover:rotate-90 duration-300 bg-white/50 rounded-full p-2"
                    disabled={isTranslating}
                >
                    <X size={24} />
                </button>

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-white shadow-inner border border-white rounded-full flex items-center justify-center mx-auto text-indigo-500 mb-4 animate-float">
                            <Key size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{uiText.UI.API_MODAL.TITLE}</h2>
                        <p className="text-sm font-medium text-gray-500 max-w-xs mx-auto leading-relaxed">{uiText.UI.API_MODAL.SUBTITLE}</p>
                    </div>

                    <div className="space-y-5">
                        {/* API Key Input */}
                        <div className="space-y-2">
                            <div className="relative group">
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={key}
                                    onChange={(e) => {
                                        setKey(e.target.value);
                                        setTestStatus('idle');
                                    }}
                                    disabled={isTranslating}
                                    placeholder={uiText.UI.API_MODAL.PLACEHOLDER}
                                    className="w-full bg-gray-50 text-gray-800 placeholder:text-gray-400 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-mono text-sm pr-12 shadow-inner hover:bg-white"
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 p-2 transition-colors"
                                    disabled={isTranslating}
                                >
                                    {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                {testStatus === 'success' && (
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500 bg-white rounded-full p-0.5 shadow-sm">
                                        <CheckCircle2 size={20} className="fill-emerald-100" />
                                    </div>
                                )}
                                {testStatus === 'error' && (
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-rose-500 bg-white rounded-full p-0.5 shadow-sm">
                                        <AlertCircle size={20} className="fill-rose-100" />
                                    </div>
                                )}
                            </div>

                            {/* Status Message */}
                            {testMessage && (
                                <div className={`text-xs font-semibold px-2 flex items-center gap-2 ${testStatus === 'error' ? 'text-rose-500' : testStatus === 'success' ? 'text-emerald-600' : 'text-indigo-500'}`}>
                                    {testStatus === 'testing' && <Loader2 size={14} className="animate-spin" />}
                                    {testMessage}
                                </div>
                            )}
                        </div>

                        {/* Language Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between px-1">
                                {uiText.UI.API_MODAL.LANGUAGE_LABEL}
                                {isTranslating && <span className="text-indigo-500 animate-pulse flex items-center gap-1"><Globe size={12} /> Translating UI...</span>}
                            </label>
                            <input
                                type="text"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                disabled={!isLanguageEnabled || isTranslating}
                                placeholder={uiText.UI.API_MODAL.LANGUAGE_PLACEHOLDER}
                                className={`w-full bg-gray-50 text-gray-800 px-6 py-4 rounded-2xl border-2 border-transparent outline-none transition-all text-sm shadow-inner ${!isLanguageEnabled || isTranslating
                                    ? 'opacity-50 cursor-not-allowed grayscale'
                                    : 'focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 hover:bg-white'
                                    }`}
                            />
                        </div>

                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 items-start">
                            <Shield size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-indigo-900/60 leading-relaxed font-medium">
                                {uiText.UI.API_MODAL.PRIVACY_NOTE}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={handleTest}
                            disabled={testStatus === 'testing' || !key.trim() || isTranslating}
                            className="flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                        >
                            {testStatus === 'testing' && <Loader2 size={18} className="animate-spin" />}
                            {uiText.UI.API_MODAL.BTN_TEST}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!key.trim() || isTranslating}
                            className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 text-white transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-0.5"
                        >
                            {isTranslating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isTranslating ? "Translating..." : uiText.UI.API_MODAL.BTN_SAVE}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
