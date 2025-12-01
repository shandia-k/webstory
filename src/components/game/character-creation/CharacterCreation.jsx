import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { generateGameSetup } from '../../../services/llmService';
import { CreationHeader } from './CreationHeader';
import { NameSection } from './NameSection';
import { RoleSelector } from './RoleSelector';
import { RoleDetails } from './RoleDetails';

export function CharacterCreation({ genre, onComplete, onBack, isTestMode }) {
    const { apiKey, language, setupData, setSetupData, uiText } = useGame();

    const [loading, setLoading] = useState(!setupData);
    const [error, setError] = useState(null);
    const [name, setName] = useState("");
    const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
    const [includeItems, setIncludeItems] = useState(true);

    // Fetch Setup Data from AI
    useEffect(() => {
        if (setupData) {
            setLoading(false);
            return;
        }

        const fetchSetup = async () => {
            try {
                setLoading(true);
                const data = await generateGameSetup(apiKey, genre, language);
                setSetupData(data);
                // Auto-set a random name initially
                if (data.suggested_names?.length > 0) {
                    setName(data.suggested_names[Math.floor(Math.random() * data.suggested_names.length)]);
                }
            } catch (err) {
                console.error("Setup Error:", err);
                setError(err.message || uiText.UI.CHARACTER_CREATION.ERROR_DEFAULT);
            } finally {
                setLoading(false);
            }
        };

        fetchSetup();
    }, [apiKey, genre, language, setupData, setSetupData]);

    const handleRandomizeName = () => {
        if (setupData?.suggested_names) {
            const randomName = setupData.suggested_names[Math.floor(Math.random() * setupData.suggested_names.length)];
            setName(randomName);
        }
    };

    const handleConfirm = () => {
        if (!name.trim()) return;

        const role = setupData.roles[selectedRoleIndex];
        const finalData = {
            name: name,
            role: role,
            items: includeItems ? role.starting_items : []
        };
        onComplete(finalData);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-theme-accent">
                <div className="w-16 h-16 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-xl font-mono animate-pulse">{uiText.UI.CHARACTER_CREATION.LOADING_TITLE}</div>
                <div className="text-sm text-theme-muted mt-2">{uiText.UI.CHARACTER_CREATION.LOADING_SUBTITLE}</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-red-500 p-4 text-center">
                <div className="text-2xl font-bold mb-2">{uiText.UI.CHARACTER_CREATION.ERROR_TITLE}</div>
                <p className="mb-4">{error}</p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onBack}
                        className="px-4 py-2 border border-gray-600 rounded hover:bg-gray-800 transition-colors"
                    >
                        {uiText.UI.CHARACTER_CREATION.BTN_ABORT}
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 border border-red-500 rounded hover:bg-red-900/20"
                    >
                        {uiText.UI.CHARACTER_CREATION.BTN_RETRY}
                    </button>
                </div>
            </div>
        );
    }

    const currentRole = setupData.roles[selectedRoleIndex];

    return (
        <div className="fixed inset-0 z-50 bg-black overflow-y-auto custom-scrollbar text-theme-text font-sans">
            <div className="min-h-screen max-w-4xl mx-auto p-4 md:p-8 flex flex-col">

                <CreationHeader
                    uiText={uiText}
                    setupData={setupData}
                    onBack={onBack}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">

                    {/* LEFT COLUMN: Name & Role Selection */}
                    <div className="space-y-6 animate-in slide-in-from-left-4 duration-700 delay-100">
                        <NameSection
                            uiText={uiText}
                            name={name}
                            setName={setName}
                            handleRandomizeName={handleRandomizeName}
                        />

                        <RoleSelector
                            uiText={uiText}
                            setupData={setupData}
                            selectedRoleIndex={selectedRoleIndex}
                            setSelectedRoleIndex={setSelectedRoleIndex}
                            includeItems={includeItems}
                            setIncludeItems={setIncludeItems}
                        />
                    </div>

                    {/* RIGHT COLUMN: Role Details */}
                    <RoleDetails
                        uiText={uiText}
                        currentRole={currentRole}
                        includeItems={includeItems}
                        name={name}
                        handleConfirm={handleConfirm}
                        confirmButtonText={isTestMode ? "INITIATE TEST" : uiText.UI.CHARACTER_CREATION.BTN_INITIATE}
                    />

                </div>
            </div>
        </div>
    );
}
