import React, { useState, useEffect } from 'react';
import { Key, Save, X, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, Shield, CheckCircle2, Globe, Bug } from 'lucide-react';
// @ts-ignore
import { testApiKey, translateUiSubset, getUiBatches } from '../../../../services/llmService';
import { useGame } from '../../../../context/GameContext';
import { TRANSLATIONS } from '../../../../constants/textUI';

interface ApiKeyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (key: string, lang: string) => void;
    onOpenDebug: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, onOpenDebug }) => {
    const { uiText, updateUiText } = useGame();
    const [key, setKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [language, setLanguage] = useState('English');
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle'); // idle, testing, success, error
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
        } catch (error: any) {
            setTestStatus('error');
            setTestMessage(error.message);
        }
    };

    const handleSave = async () => {
        if (!key.trim()) return;

        const trimmedKey = key.trim();
        const trimmedLang = language.trim();

        // Check if translation is needed
        // @ts-ignore
        const isPredefined = Object.keys(TRANSLATIONS).some(k => k.toLowerCase() === trimmedLang.toLowerCase());

        if (!isPredefined) {
            setIsTranslating(true);
            try {
                // 1. Get Batches
                // @ts-ignore
                const { critical, secondary } = getUiBatches(TRANSLATIONS['English']);

                // 2. Translate Critical Batch (Blocking)
                const criticalTranslated = await translateUiSubset(trimmedKey, trimmedLang, critical);

                // 3. Update UI with Critical Translations (keep secondary in English for now)
                // @ts-ignore
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
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out ${isOpen ? 'opacity-100 visible backdrop-blur-sm bg-black/60' : 'opacity-0 invisible backdrop-blur-none bg-black/0 pointer-events-none'}`}>
            <div className={`paper-card bg-theme-panel p-8 w-full max-w-md transition-all duration-300 ease-out delay-75 ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-8 opacity-0'}`}>
                {/* Decorative Tape */}
                <div className="tape-top" />

                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 text-theme-muted hover:text-theme-accent transition-colors z-20 hover:rotate-90 duration-300"
                    disabled={isTranslating}
                >
                    <X size={24} />
                </button>

                <div className="relative z-10 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 bg-theme-panel border-2 border-theme-border shadow-paper rounded-full flex items-center justify-center mx-auto text-theme-accent mb-4 animate-float-paper">
                            <Key size={32} strokeWidth={2.5} />
                        </div>
                        <h2 className="text-2xl font-bold text-theme-text tracking-tight uppercase">{uiText.UI.API_MODAL.TITLE}</h2>
                        <p className="text-sm font-medium text-theme-muted max-w-xs mx-auto leading-relaxed">{uiText.UI.API_MODAL.SUBTITLE}</p>
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
                                    className="w-full bg-theme-main text-theme-text placeholder:text-theme-muted px-6 py-4 rounded-xl border-2 border-theme-border focus:border-theme-accent outline-none transition-all font-mono text-sm pr-12 shadow-inner"
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme-accent p-2 transition-colors"
                                    disabled={isTranslating}
                                >
                                    {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                {testStatus === 'success' && (
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500 bg-theme-panel rounded-full p-0.5 shadow-sm">
                                        <CheckCircle2 size={20} className="fill-emerald-100" />
                                    </div>
                                )}
                                {testStatus === 'error' && (
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-rose-500 bg-theme-panel rounded-full p-0.5 shadow-sm">
                                        <AlertCircle size={20} className="fill-rose-100" />
                                    </div>
                                )}
                            </div>

                            {/* Status Message */}
                            {testMessage && (
                                <div className={`text-xs font-semibold px-2 flex items-center gap-2 ${testStatus === 'error' ? 'text-rose-500' : testStatus === 'success' ? 'text-emerald-600' : 'text-theme-accent'}`}>
                                    {testStatus === 'testing' && <Loader2 size={14} className="animate-spin" />}
                                    {testMessage}
                                </div>
                            )}
                        </div>

                        {/* Language Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-theme-muted uppercase tracking-widest flex items-center justify-between px-1">
                                {uiText.UI.API_MODAL.LANGUAGE_LABEL}
                                {isTranslating && <span className="text-theme-accent animate-pulse flex items-center gap-1"><Globe size={12} /> Translating...</span>}
                            </label>
                            <input
                                type="text"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                disabled={!isLanguageEnabled || isTranslating}
                                placeholder={uiText.UI.API_MODAL.LANGUAGE_PLACEHOLDER}
                                className={`w-full bg-theme-main text-theme-text px-6 py-4 rounded-xl border-2 border-theme-border outline-none transition-all text-sm shadow-inner ${!isLanguageEnabled || isTranslating
                                    ? 'opacity-50 cursor-not-allowed grayscale'
                                    : 'focus:border-theme-accent'
                                    }`}
                            />
                        </div>

                        <div className="bg-theme-main/50 border border-theme-border rounded-xl p-4 flex gap-3 items-start">
                            <Shield size={18} className="text-theme-accent shrink-0 mt-0.5" />
                            <p className="text-[11px] text-theme-muted leading-relaxed font-medium">
                                {uiText.UI.API_MODAL.PRIVACY_NOTE}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={handleTest}
                            disabled={testStatus === 'testing' || !key.trim() || isTranslating}
                            className="flex-1 px-6 py-4 rounded-xl border-2 border-theme-border text-theme-text hover:bg-theme-main transition-all text-sm font-bold shadow-paper active:translate-y-1 active:shadow-none"
                        >
                            {testStatus === 'testing' ? <Loader2 size={18} className="animate-spin invisible" /> : null}
                            {uiText.UI.API_MODAL.BTN_TEST}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!key.trim() || isTranslating}
                            className="flex-1 px-6 py-4 rounded-xl bg-theme-accent text-white transition-all text-sm font-bold shadow-paper hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
                        >
                            {isTranslating ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {isTranslating ? "..." : uiText.UI.API_MODAL.BTN_SAVE}
                        </button>
                    </div>

                    {/* DEV BUTTON */}
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={() => { onClose(); onOpenDebug(); }}
                            className="text-[10px] text-theme-muted hover:text-theme-accent font-mono flex items-center gap-1 transition-colors uppercase tracking-widest"
                        >
                            <Bug size={10} />
                            Developer Console
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

