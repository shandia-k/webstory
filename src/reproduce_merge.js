
const UI_TEXT_EN = {
    CHARACTER_CREATION: {
        TITLE: "IDENTITY CONSTRUCT",
        LABEL_NAME: "Subject Name",
        STATS_TITLE: "Vital Statistics"
    },
    MENU: {
        SAVE: "Save Game"
    }
};

// 1. Simulation: LLM returns partial data (missing keys)
const MOCK_LLM_PARTIAL = {
    CHARACTER_CREATION: {
        TITLE: "KONSTRUKSI IDENTITAS"
    }
};

// 2. Simulation: LLM returns wrong type (string instead of object)
const MOCK_LLM_WRONG_TYPE = {
    CHARACTER_CREATION: "Ini bukan objek tapi string error"
};

// 3. Simulation: LLM returns null for a section
const MOCK_LLM_NULL_SECTION = {
    CHARACTER_CREATION: null
};

// 4. Simulation: LLM returns null for a value
const MOCK_LLM_NULL_VALUE = {
    CHARACTER_CREATION: {
        TITLE: null
    }
};

// The NEW deepMerge function from useGameState.js
const deepMerge = (target, source) => {
    const output = { ...target };
    if (source && typeof source === 'object' && !Array.isArray(source)) {
        Object.keys(source).forEach(key => {
            const sourceValue = source[key];
            const targetValue = target[key];

            const isSourceObj = sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue);
            const isTargetObj = targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue);

            if (isTargetObj) {
                // Target is object. Only merge if source is also object.
                if (isSourceObj) {
                    output[key] = deepMerge(targetValue, sourceValue);
                }
                // If source is not object (e.g. string/null), IGNORE it. Keep target structure.
            } else {
                // Target is primitive. Overwrite if source is valid.
                if (sourceValue !== undefined && sourceValue !== null) {
                    Object.assign(output, { [key]: sourceValue });
                }
            }
        });
    }
    return output;
};

console.log("--- TEST 1: Partial Data ---");
const res1 = deepMerge(UI_TEXT_EN, MOCK_LLM_PARTIAL);
console.log(JSON.stringify(res1, null, 2));

console.log("\n--- TEST 2: Wrong Type (String vs Object) ---");
const res2 = deepMerge(UI_TEXT_EN, MOCK_LLM_WRONG_TYPE);
console.log(JSON.stringify(res2, null, 2));
// Expect: CHARACTER_CREATION remains English object (Safe)

console.log("\n--- TEST 3: Null Section ---");
const res3 = deepMerge(UI_TEXT_EN, MOCK_LLM_NULL_SECTION);
console.log(JSON.stringify(res3, null, 2));

console.log("\n--- TEST 4: Null Value ---");
const res4 = deepMerge(UI_TEXT_EN, MOCK_LLM_NULL_VALUE);
console.log(JSON.stringify(res4, null, 2));
