import React, { useState, useMemo, useRef, useEffect } from 'react';

type Language = 'js' | 'json';
type AvailableVariables = Record<string, string[]>;

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: Language;
    availableVariables?: AvailableVariables;
    placeholder?: string;
    rows?: number;
}

function applySyntaxHighlighting(code: string, language: Language, availableVariables: AvailableVariables): string {
    if (!code) return '';

    let highlightedCode = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    if (language === 'json') {
        highlightedCode = highlightedCode
            .replace(/"(.*?)"(?=:)/g, '<span class="token property">"$1"</span>') // Keys
            .replace(/"(.*?)"(?!:)/g, '<span class="token string">"$1"</span>')   // String values
            .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="token number">$1</span>') // Numbers
            .replace(/\b(true|false)\b/g, '<span class="token boolean">$1</span>') // Booleans
            .replace(/\b(null)\b/g, '<span class="token keyword">$1</span>')     // Null
            .replace(/([{}\[\]:,])/g, '<span class="token punctuation">$1</span>'); // Punctuation
    } else { // js
        const keywords = ['if', 'else', 'return', 'true', 'false', 'null', 'undefined'];
        const operators = ['===', '!==', '==', '!=', '&&', '\\|\\|', '>', '<', '>=', '<='];
        const variableRoots = Object.keys(availableVariables);

        highlightedCode = highlightedCode
            .replace(/(\/\/.*)/g, '<span class="token comment">$1</span>') // Comments
            .replace(/('.*?'|".*?")/g, '<span class="token string">$1</span>') // Strings
            .replace(new RegExp(`\\b(${keywords.join('|')})\\b`, 'g'), '<span class="token keyword">$1</span>') // Keywords
            .replace(/\b(\d+(\.\d+)?)\b/g, '<span class="token number">$1</span>') // Numbers
            .replace(new RegExp(`\\b(${variableRoots.join('|')})\\b`, 'g'), '<span class="token variable">$1</span>') // Variables
            .replace(new RegExp(`(${operators.join('|')})`, 'g'), '<span class="token operator">$1</span>') // Operators
            .replace(/([.(){}[\];,])/g, '<span class="token punctuation">$1</span>'); // Punctuation
    }

    return highlightedCode;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, language = 'js', availableVariables = {}, placeholder, rows = 4 }) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const highlightedHtml = useMemo(() => applySyntaxHighlighting(value, language, availableVariables), [value, language, availableVariables]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        onChange(val);

        const cursorPos = e.target.selectionStart;
        const textBeforeCursor = val.substring(0, cursorPos);
        const lastWord = textBeforeCursor.split(/[\s(,;{[]+/).pop() || '';
        
        if (lastWord.endsWith('.')) {
            const parts = lastWord.slice(0, -1).split('.');
            const rootVar = parts[0];
            if (availableVariables[rootVar]) {
                const availableProps = availableVariables[rootVar];
                setSuggestions(availableProps);
                setShowSuggestions(true);
            } else {
                setShowSuggestions(false);
            }
        } else {
            setShowSuggestions(false);
        }
    };
    
    const handleSuggestionClick = (suggestion: string) => {
        if (!textareaRef.current) return;
        
        const cursorPos = textareaRef.current.selectionStart;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastWordIndex = textBeforeCursor.lastIndexOf('.') + 1;
        const textAfterCursor = value.substring(cursorPos);
        
        const newValue = textBeforeCursor.substring(0, lastWordIndex) + suggestion + textAfterCursor;
        onChange(newValue);
        setShowSuggestions(false);
        textareaRef.current.focus();
    };

    return (
        <div className="code-editor-wrapper">
            <pre className="code-editor-pre" aria-hidden="true" style={{ minHeight: `${rows * 1.5}rem`}}>
                <code dangerouslySetInnerHTML={{ __html: highlightedHtml + '\n' }} />
            </pre>
            <textarea
                ref={textareaRef}
                className="code-editor-textarea"
                style={{ minHeight: `${rows * 1.5}rem`}}
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
            />
             {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-48 bg-card border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    <ul className="py-1">
                        {suggestions.map((s) => (
                            <li 
                                key={s} 
                                onClick={() => handleSuggestionClick(s)}
                                className="px-3 py-1 text-xs cursor-pointer hover:bg-muted"
                            >
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CodeEditor;