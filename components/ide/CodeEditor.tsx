import React, { useRef, useEffect, useLayoutEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

// A more robust (but still simple) syntax highlighter for Java
const highlightJava = (code: string): string => {
    if (!code) return '';
    // 1. Escape HTML characters to prevent XSS and rendering issues
    let highlightedCode = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // 2. Highlight comments first to prevent highlighting keywords inside them
    highlightedCode = highlightedCode.replace(/(\/\*[\s\S]*?\*\/)|(\/\/.*)/g, '<span class="text-green-500/70">$1$2</span>');

    // 3. Highlight strings
    highlightedCode = highlightedCode.replace(/"([^"]*?)"/g, '<span class="text-orange-400">"$1"</span>');
    
    // 4. Highlight keywords and types
    const keywords = ['public', 'private', 'protected', 'class', 'void', 'import', 'package', 'extends', 'final', 'static', 'return', 'implements', 'enum', 'interface', 'if', 'else', 'for', 'while', 'switch', 'case', 'break', 'new', 'this', 'super'];
    const annotations = ['@Override', '@Mod', '@SubscribeEvent', 'EventHandler', '@SuppressWarnings'];
    const primitives = ['int', 'double', 'boolean', 'char', 'long', 'float', 'short', 'byte'];
    const commonTypes = ['String', 'Player', 'ItemStack', 'Material', 'Logger', 'Block', 'Item', 'World', 'Event', 'Component', 'Text'];
    
    highlightedCode = highlightedCode.replace(new RegExp(`\\b(${[...keywords, ...primitives].join('|')})\\b`, 'g'), '<span class="text-purple-400">$1</span>');
    highlightedCode = highlightedCode.replace(new RegExp(`\\b(${commonTypes.join('|')})\\b`, 'g'), '<span class="text-sky-400">$1</span>');
    highlightedCode = highlightedCode.replace(new RegExp(`(${annotations.join('|')})`, 'g'), '<span class="text-yellow-500">$1</span>');

    // 5. Highlight method calls
    highlightedCode = highlightedCode.replace(/(\.)(\w+)(?=\()/g, '$1<span class="text-primary">$2</span>');

    return highlightedCode;
};


const LineNumbers: React.FC<{ count: number }> = ({ count }) => (
    <div className="text-right text-light-text/40 select-none pr-4 pt-4 shrink-0 font-mono text-sm leading-relaxed" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
            <div key={i}>{i + 1}</div>
        ))}
    </div>
);

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  value = '', 
  onChange, 
  language = 'java',
  readOnly = false 
}) => {
  const lines = value.split('\n').length;
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const highlightedCode = highlightJava(value) + '\n'; // Add trailing newline to prevent layout shifts

  // Sync scroll positions between textarea and pre
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    const pre = preRef.current;
    if (!textarea || !pre) return;

    const syncScroll = () => {
      pre.scrollTop = textarea.scrollTop;
      pre.scrollLeft = textarea.scrollLeft;
    };

    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, []);

  return (
    <div className="relative h-full font-mono text-sm bg-darker overflow-hidden flex">
      <LineNumbers count={lines} />
      <div className="relative flex-1 h-full">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => !readOnly && onChange(e.target.value)}
          className="absolute inset-0 w-full h-full p-4 bg-transparent caret-light outline-none resize-none whitespace-pre-wrap break-words leading-relaxed overflow-auto font-mono text-sm text-transparent"
          style={{ 
            fontFamily: "'JetBrains Mono', monospace",
            WebkitTextFillColor: 'transparent', // Make text transparent
            tabSize: 4,
          }}
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          readOnly={readOnly}
        />
        <pre
          ref={preRef}
          className="absolute inset-0 w-full h-full text-light outline-none p-4 m-0 whitespace-pre-wrap break-words leading-relaxed overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        </pre>
      </div>
    </div>
  );
};
