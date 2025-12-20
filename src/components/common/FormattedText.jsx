import React from 'react';

/**
 * Renders text with support for basic HTML tags like <b>, <i>, <strong>, <em>.
 * Checks if text contains tags, if so parses them.
 * This is a lightweight alternative to dangerouslySetInnerHTML for known safe tags.
 */
const FormattedText = ({ text, className = "" }) => {
    if (!text) return null;

    // specific regex to match <b>...</b>, <i>...</i>, <strong>...</strong>, <em>...</em> tags
    // This splits the text into parts: plain text, and tagged text.
    const parts = text.split(/(<\/?(?:b|i|strong|em)>)/g);

    let currentTag = null;

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.match(/<b|strong>/)) {
                    currentTag = 'bold';
                    return null;
                } else if (part.match(/<i|em>/)) {
                    currentTag = 'italic';
                    return null;
                } else if (part.match(/<\//)) {
                    currentTag = null;
                    return null;
                } else {
                    if (currentTag === 'bold') {
                        return <strong key={index} className="font-bold text-indigo-600">{part}</strong>;
                    } else if (currentTag === 'italic') {
                        return <em key={index} className="italic text-gray-500">{part}</em>;
                    } else {
                        return <span key={index}>{part}</span>;
                    }
                }
            })}
        </span>
    );
};

export default FormattedText;
