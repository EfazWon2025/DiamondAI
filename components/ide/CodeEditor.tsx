import React, { useRef, useLayoutEffect, useCallback } from 'react';

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const highlightJava = (code: string): string => {
    if (!code) return '';

    const classMap = {
        comment: 'text-green-500/70',
        string: 'text-orange-400',
        keyword: 'text-purple-400',
        type: 'text-sky-400',
        annotation: 'text-yellow-500',
        method: 'text-primary',
        number: 'text-teal-300',
    };

    const keywords = ['public', 'private', 'protected', 'class', 'void', 'import', 'package', 'extends', 'final', 'static', 'return', 'implements', 'enum', 'interface', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'new', 'this', 'super', 'true', 'false', 'null', 'try', 'catch', 'finally', 'instanceof'];
    const primitiveTypes = ['int', 'double', 'boolean', 'char', 'long', 'float', 'short', 'byte'];

    const patterns = [
        { className: classMap.comment, regex: /(\/\*[\s\S]*?\*\/|\/\/.*)/g },
        { className: classMap.string, regex: /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g },
        { className: classMap.annotation, regex: /(@[A-Z]\w*)/g },
        { className: classMap.method, regex: /\.([a-zA-Z_]\w*)\s*(?=\()/g, group: 1 },
        { className: classMap.keyword, regex: new RegExp(`\\b(${keywords.join('|')})\\b`, 'g') },
        { className: classMap.type, regex: new RegExp(`\\b(${primitiveTypes.join('|')})\\b`, 'g') },
        { className: classMap.type, regex: /\b([A-Z][a-zA-Z0-9_]*)\b/g },
        { className: classMap.number, regex: /\b(\d+(\.\d*)?|\.\d+)([fFdDlL]?)\b/g },
    ];

    const replacements: string[] = [];
    const placeholder = (index: number) => `__REPL_${index}__`;

    let tempCode = code;
    
    patterns.forEach(({ className, regex, group = 0 }) => {
        tempCode = tempCode.replace(regex, (match, ...args) => {
            const captures = args.slice(0, -2);
            const toHighlight = group > 0 ? captures[group - 1] : match;

            if (toHighlight === undefined) return match;

            let highlightedMatch;
            if (group > 0) {
                const startIndex = match.indexOf(toHighlight);
                const prefix = match.substring(0, startIndex);
                const suffix = match.substring(startIndex + toHighlight.length);
                highlightedMatch = `${escapeHtml(prefix)}<span class="${className}">${escapeHtml(toHighlight)}</span>${escapeHtml(suffix)}`;
            } else {
                highlightedMatch = `<span class="${className}">${escapeHtml(match)}</span>`;
            }

            replacements.push(highlightedMatch);
            return placeholder(replacements.length - 1);
        });
    });

    let highlightedCode = escapeHtml(tempCode);
    replacements.forEach((rep, i) => {
        highlightedCode = highlightedCode.replace(placeholder(i), rep);
    });
    
    return highlightedCode;
};

const LineNumbers: React.FC<{ count: number }> = ({ count }) => (
    <div className="text-right text-light-text/40 select-none pr-4 pt-4 shrink-0 font-mono text-sm leading-relaxed" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => <div key={i}>{i + 1}</div>)}
    </div>
);

interface CodeEditorProps {
    value: string;
    onChange: (v: string) => void;
    onCursorChange?: (pos: { line: number; col: number }) => void;
    language?: string;
    readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value = '', onChange, onCursorChange, language = 'java', readOnly = false }) => {
  const lines = value.split('\n').length;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const highlightedCode = (language === 'java' ? highlightJava(value) : escapeHtml(value)) + '\n';

  const updateCursorPosition = useCallback(() => {
    if (!onCursorChange || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPosition = textarea.selectionStart;
    const textUpToCursor = textarea.value.substring(0, cursorPosition);
    const lines = textUpToCursor.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    onCursorChange({ line, col });
  }, [onCursorChange]);


  useLayoutEffect(() => {
    updateCursorPosition();
  }, [value, updateCursorPosition]);

  const commonClasses = "w-full p-4 m-0 bg-transparent outline-none resize-none whitespace-pre-wrap break-words leading-relaxed font-mono text-sm";

  return (
    <div className="font-mono text-sm bg-darker flex">
      <LineNumbers count={lines} />
      <div className="relative flex-1 grid">
        <pre 
          className={`${commonClasses} text-light pointer-events-none`}
          style={{ gridArea: '1 / 1' }} 
          aria-hidden="true"
        >
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          className={`${commonClasses} caret-light text-transparent overflow-hidden`}
          style={{ gridArea: '1 / 1', WebkitTextFillColor: 'transparent', tabSize: 4 }}
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};