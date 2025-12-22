import React from 'react';

interface FormattedTextProps {
    text: string;
    className?: string;
}

/**
 * Renders text with support for basic HTML tags like <b>, <i>, <strong>, <em>.
 * Checks if text contains tags, if so parses them.
 * This is a lightweight alternative to dangerouslySetInnerHTML for known safe tags.
 */
const FormattedText: React.FC<FormattedTextProps> = ({ text, className = "" }) => {
    if (!text) return null;

    // specific regex to match <b>...</b>, <i>...</i>, <strong>...</strong>, <em>...</em> tags
    // This splits the text into parts: plain text, and tagged text.
    const parts = text.split(/(<\/?(?:b|i|strong|em)>)/g).filter(p => p !== undefined && p !== "");

    let currentTag: 'bold' | 'italic' | null = null;

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
                        return <strong key={index} className="font-bold">{part}</strong>;
                    } else if (currentTag === 'italic') {
                        return <em key={index} className="italic">{part}</em>;
                    } else {
                        return <span key={index}>{part}</span>;
                    }
                }
            })}
        </span>
    );
};

export default FormattedText;

