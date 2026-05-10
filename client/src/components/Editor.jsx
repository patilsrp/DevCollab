// client/src/components/Editor.jsx
import MonacoEditor from '@monaco-editor/react';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp',
  'csharp', 'go', 'rust', 'html', 'css', 'sql'
];

export default function Editor({ code, language, onCodeChange, onCursorChange, onLanguageChange }) {

  function handleEditorMount(editor) {
    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      onCursorChange({
        lineNumber: e.position.lineNumber,
        column: e.position.column
      });
    });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Language Selector Toolbar */}
      <div style={{ background: '#252526', padding: '8px 16px', display: 'flex', gap: '8px',
                    alignItems: 'center', borderBottom: '1px solid #333' }}>
        <span style={{ color: '#888', fontSize: '13px' }}>Language:</span>
        <select
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          style={{ background: '#3c3c3c', color: 'white', border: '1px solid #555',
                   padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
        >
          {LANGUAGES.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Monaco Editor */}
      <MonacoEditor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={onCodeChange}
        onMount={handleEditorMount}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,   // Resizes when window changes
          tabSize: 2,
          wordWrap: 'on'
        }}
      />
    </div>
  );
}