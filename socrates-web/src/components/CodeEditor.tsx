import { useRef } from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onLockAccount: (reason: string) => void;
  onWarning?: (msg: string) => void;
  onChange?: (code: string) => void;
}

export default function CodeEditor({ code, onLockAccount, onWarning, onChange }: CodeEditorProps) {
  const internalClipboard = useRef<string>('');
  const lastKeyTime = useRef<number>(Date.now());
  const fastKeyCount = useRef<number>(0);
  const anomalyStrikes = useRef<number>(0);
  
  const handleEditorDidMount = (editor: any, monaco: any) => {
    // 1. Feature 5a: Internal Copy Capture
    editor.onKeyDown((e: any) => {
      // Catch Ctrl+C or Cmd+C (Internal Copy)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === monaco.KeyCode.KeyC) {
        const selection = editor.getModel().getValueInRange(editor.getSelection());
        internalClipboard.current = selection;
      }
    });

    // 2. Feature 5a: Block External Pastes gracefully
    const domNode = editor.getContainerDomNode();
    if (domNode) {
      domNode.addEventListener('paste', (e: ClipboardEvent) => {
        const pastedText = e.clipboardData?.getData('text') || '';
        
        // If it's a large paste and doesn't match what they copied from inside the editor
        if (pastedText.length > 10 && pastedText !== internalClipboard.current) {
          e.preventDefault(); // Prevent direct clipboard insertion
          e.stopPropagation();
          
          anomalyStrikes.current += 1;
          if (anomalyStrikes.current <= 2) {
             if (onWarning) {
               onWarning('⚠️ Academic Integrity Signal: External code paste blocked. Repeated attempts will be flagged for instructor review.');
             }
          } else {
             onLockAccount('Multiple external paste attempts flagged for instructor review.');
          }
        }
      }, true);
    }
  };

  const handleOnChange = (value: string | undefined, ev: any) => {
    if (value === undefined) return;
    if (onChange) onChange(value);

    // Feature 5b: Rapid Text Insertion / Macro Signal Detection
    const now = Date.now();
    const timeDiff = now - lastKeyTime.current;
    
    // Only check single-character typing (not pastes or backspaces)
    if (ev.changes && ev.changes.length > 0 && ev.changes[0].text.length === 1) {
      // Less than 30ms between keys is unusually fast
      if (timeDiff > 0 && timeDiff < 30) { 
        fastKeyCount.current += 1;
        
        // If sustained for 25+ consecutive characters without pauses
        if (fastKeyCount.current > 25) {
           anomalyStrikes.current += 1;
           fastKeyCount.current = 0; // reset
           
           if (anomalyStrikes.current <= 2) {
              if (onWarning) {
                onWarning('⚠️ Academic Integrity Signal: Unusually high typing velocity detected. Ensure code is written directly.');
              }
           } else {
              onLockAccount('Sustained rapid text insertion signal flagged for instructor review.');
           }
        }
      } else if (timeDiff >= 30) {
        fastKeyCount.current = 0;
      }
    }
    
    lastKeyTime.current = now;
  };

  return (
    <div className="flex-grow bg-[#1e1e1e] border-b border-gray-700 overflow-hidden min-h-0 relative">
      <Editor
        height="100%"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={handleOnChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
