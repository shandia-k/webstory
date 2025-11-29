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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-theme-panel border border-theme-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-theme-muted hover:text-theme-text transition-colors z-20"
                    disabled={isTranslating}
                >
                    <X size={20} />
                </button>

                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-theme-accent/10 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-theme-accent/20 rounded-full flex items-center justify-center mx-auto text-theme-accent mb-4">
                            <Key size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-theme-text">{uiText.UI.API_MODAL.TITLE}</h2>
                        <p className="text-xs text-theme-muted">{uiText.UI.API_MODAL.SUBTITLE}</p>
                    </div>

                    <div className="space-y-4">
                        {/* API Key Input */}
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={key}
                                    onChange={(e) => {
                                        setKey(e.target.value);
                                        setTestStatus('idle');
                                    }}
                                    disabled={isTranslating}
                                    placeholder={uiText.UI.API_MODAL.PLACEHOLDER}
                                    className="w-full bg-black/40 text-theme-text placeholder:text-theme-muted/50 px-4 py-3 rounded-xl border border-theme-border focus:border-theme-accent focus:ring-1 focus:ring-theme-accent outline-none transition-all font-mono text-sm pr-12"
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-text p-2"
                                    disabled={isTranslating}
                                >
                                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                {testStatus === 'success' && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                                        <CheckCircle2 size={18} />
                                    </div>
                                )}
                                {testStatus === 'error' && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                                        <AlertCircle size={18} />
                                    </div>
                                )}
                            </div>

                            {/* Status Message */}
                            {testMessage && (
                                <div className={`text-xs flex items-center gap-2 ${testStatus === 'error' ? 'text-red-400' : testStatus === 'success' ? 'text-emerald-400' : 'text-theme-accent'}`}>
                                    {testStatus === 'testing' && <Loader2 size={14} className="animate-spin" />}
                                    {testMessage}
                                </div>
                            )}
                        </div>

                        {/* Language Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-theme-muted uppercase tracking-wider flex items-center justify-between">
                                {uiText.UI.API_MODAL.LANGUAGE_LABEL}
                                {isTranslating && <span className="text-theme-accent animate-pulse flex items-center gap-1"><Globe size={12} /> Translating UI...</span>}
                            </label>
                            <input
                                type="text"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                disabled={!isLanguageEnabled || isTranslating}
                                placeholder={uiText.UI.API_MODAL.LANGUAGE_PLACEHOLDER}
                                className={`w-full bg-black/40 text-theme-text px-4 py-3 rounded-xl border border-theme-border outline-none transition-all text-sm ${!isLanguageEnabled || isTranslating ? 'opacity-50 cursor-not-allowed' : 'focus:border-theme-accent focus:ring-1 focus:ring-theme-accent'
                                    }`}
                            />
                        </div>

                        <div className="bg-theme-accent/5 border border-theme-accent/10 rounded-lg p-3 flex gap-3 items-start">
                            <Shield size={16} className="text-theme-accent shrink-0 mt-0.5" />
                            <p className="text-[10px] text-theme-muted leading-relaxed">
                                {uiText.UI.API_MODAL.PRIVACY_NOTE}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={handleTest}
                            disabled={testStatus === 'testing' || !key.trim() || isTranslating}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-theme-border text-theme-text hover:bg-theme-panel transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {testStatus === 'testing' && <Loader2 size={16} className="animate-spin" />}
                            {uiText.UI.API_MODAL.BTN_TEST}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!key.trim() || isTranslating}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent/90 text-white transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-theme-accent/20 flex items-center justify-center gap-2"
                        >
                            {isTranslating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isTranslating ? "Translating..." : uiText.UI.API_MODAL.BTN_SAVE}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
