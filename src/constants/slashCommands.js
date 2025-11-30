export const SLASH_COMMANDS = {
    '/visual': `SYSTEM OVERRIDE: The user is testing the visual engine. 
    GENERATE a narrative about a beautiful, hallucinogenic visual phenomenon.
    MUST include a "visual_effect" object with:
    - color: A vibrant neon color (e.g. #00ffcc or #ff00ff).
    - keyframes: Complex CSS keyframes for a flowing or pulsing animation.
    - animation: "3s infinite alternate".
    - font_style: "letter-spacing: 2px; font-weight: bold;"`,

    '/glitch': `SYSTEM OVERRIDE: CRITICAL SYSTEM FAILURE DETECTED.
    GENERATE a narrative about a digital corruption or hacking event.
    MUST include a "visual_effect" object with:
    - color: #00ff00 (Matrix green) or #ff00ff (Cyberpunk pink).
    - keyframes: "0% { transform: translate(0); } 20% { transform: translate(-2px, 2px); } 40% { transform: translate(-2px, -2px); } 60% { transform: translate(2px, 2px); } 80% { transform: translate(2px, -2px); } 100% { transform: translate(0); }"
    - animation: "0.2s infinite".
    - font_style: "font-family: monospace;"`,

    '/horror': `SYSTEM OVERRIDE: PSYCHOLOGICAL THREAT DETECTED.
    GENERATE a narrative about a terrifying, unseen presence.
    MUST include a "visual_effect" object with:
    - color: #ff0000 (Blood red).
    - keyframes: "0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); }"
    - animation: "3s infinite ease-in-out".
    - font_style: "font-family: serif; font-style: italic;"`,

    '/shake': `SYSTEM OVERRIDE: IMPACT DETECTED.
    GENERATE a narrative about an explosion or earthquake.
    MUST include a "visual_effect" object with:
    - color: #ffaa00 (Orange).
    - keyframes: "0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); }"
    - animation: "0.5s infinite".
    - font_style: "font-weight: 900; text-transform: uppercase;"`,

    '/combo': `SYSTEM OVERRIDE: CRITICAL MOMENT - COMBO UNLOCKED.
    GENERATE a narrative where the player has a fleeting opportunity to combine actions.
    MUST include:
    - "allow_combo": true
    - "narrative": "TIME DILATION ACTIVE. You spot a critical weakness. Combine your actions now!"
    - "visual_effect": { "color": "#00ffff", "animation": "pulse 1s infinite" }`
};
