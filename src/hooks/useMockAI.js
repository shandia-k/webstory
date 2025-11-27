import { useState, useCallback } from 'react';

export function useMockAI() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'system',
            content: 'System initialized • Sector 7',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        {
            id: 2,
            role: 'ai',
            content: 'Hujan neon membasahi jaket sintetikmu. Drone polisi berpatroli di atas, memindai setiap sudut lorong gelap ini.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const generateResponse = (input) => {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('hack') || lowerInput.includes('retas')) {
            return "Accessing local mainframe... [||||||||||] 100%. Access Granted. You found a decrypted data shard.";
        }
        if (lowerInput.includes('look') || lowerInput.includes('lihat') || lowerInput.includes('periksa')) {
            return "Scanning environment... Visual sensors detect high levels of radiation in the east sector. Proceed with caution.";
        }
        if (lowerInput.includes('status') || lowerInput.includes('cek')) {
            return "Diagnostic complete. Systems operating at 98% efficiency. No critical damage detected.";
        }

        const defaultResponses = [
            `I processed your input: "${input}". Awaiting further instructions.`,
            "The city breathes around you. What is your next move?",
            "Command received. Executing protocols...",
            "Unrecognized pattern. Please clarify your intent."
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    };

    const sendMessage = useCallback((text) => {
        if (!text.trim()) return;

        // Add User Message
        const userMsg = {
            id: Date.now(),
            role: 'user',
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        // Simulate AI Delay
        setTimeout(() => {
            const aiResponse = {
                id: Date.now() + 1,
                role: 'ai',
                content: generateResponse(text),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500 + Math.random() * 1000); // 1.5s - 2.5s delay

    }, []);

    return {
        messages,
        sendMessage,
        isTyping
    };
}
