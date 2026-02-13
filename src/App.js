import React, { useState, useEffect, useCallback } from 'react';
import {
  Folder, HardDrive, LayoutTemplate, RotateCcw, Undo2,
  PlusSquare, Copy, FileCode, FileText, FileJson
} from 'lucide-react';
import './App.css';

function parsePathToTree(pathString) {
  const lines = pathString.split('\n').filter(line => line.trim() !== "");
  let tree = [];
  lines.forEach(line => {
    const parts = line.split('/').filter(p => p !== "");
    let currentLevel = tree;
    parts.forEach((part) => {
      let existingNode = currentLevel.find(item => item.name === part);
      if (!existingNode) {
        existingNode = { name: part, children: [] };
        currentLevel.push(existingNode);
      }
      currentLevel = existingNode.children;
    });
  });
  return tree;
}

function getFileIcon(name) {
  if (!name.includes('.')) return <Folder size={18} color="#818cf8" fill="rgba(129, 140, 248, 0.2)" />;
  const ext = name.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js': case 'jsx': case 'ts': case 'tsx': return <FileCode size={18} color="#eab308" />;
    case 'css': case 'scss': return <FileText size={18} color="#3b82f6" />;
    case 'json': return <FileJson size={18} color="#06b6d4" />;
    default: return <FileText size={18} color="#94a3b8" />;
  }
}

function FolderNode({ node, onMove, onRename, pathPrefix = "" }) {
  const [isOver, setIsOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(node.name);

  const currentPath = pathPrefix ? `${pathPrefix}/${node.name}` : node.name;
  const isFile = node.name.includes('.');

  function handleBlur() {
    setIsEditing(false);
    if (tempName !== node.name) onRename(currentPath, tempName);
  };

  return (
    <div className="folder-container">
      <div
        className={`folder-item ${isOver ? 'drag-over' : ''} ${isFile ? 'is-file' : ''}`}
        draggable={!isEditing}
        onDragStart={(e) => {
          e.dataTransfer.setData("type", "MOVE");
          e.dataTransfer.setData("path", currentPath);
          e.currentTarget.classList.add('dragging');
        }}
        onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
        onDragOver={(e) => {
          e.preventDefault();
          if (!isFile) setIsOver(true);
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          if (isFile) return;
          const type = e.dataTransfer.getData("type");
          const draggedPath = e.dataTransfer.getData("path");
          if (type === "NEW") onMove(null, currentPath, true);
          else if (draggedPath !== currentPath) onMove(draggedPath, currentPath, false);
        }}
      >
        {getFileIcon(node.name)}
        {isEditing ? (
          <input
            autoFocus className="edit-input" value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleBlur} onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
          />
        ) : (
          <span className="folder-name" onClick={() => setIsEditing(true)}>{node.name}</span>
        )}
      </div>
      {node.children.length > 0 && (
        <div className="indent">
          {node.children.map((child, i) => (
            <FolderNode key={i} node={child} onMove={onMove} onRename={onRename} pathPrefix={currentPath} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const initialText = "src/App.js\nsrc/components/Header.jsx\napi/routes.ts";
  const [text, setText] = useState(initialText);
  const [history, setHistory] = useState([]);
  const [tree, setTree] = useState([]);
  const loadPreset = (type) => {
    const presets = {
      next: [
        "app/layout.tsx",
        "app/page.tsx",
        "app/globals.css",
        "app/(auth)/login/page.tsx",
        "app/(auth)/register/page.tsx",
        "app/api/user/route.ts",
        "components/ui/button.tsx",
        "components/ui/card.tsx",
        "components/shared/navbar.tsx",
        "lib/utils.ts",
        "lib/auth.ts",
        "public/next.svg",
        "next.config.js",
        "package.json",
        "tsconfig.json"
      ].join('\n'),

      clean: [
        "src/core/entities/User.ts",
        "src/core/entities/Product.ts",
        "src/core/use-cases/auth/Login.ts",
        "src/core/use-cases/product/CreateProduct.ts",
        "src/infra/db/prisma/schema.prisma",
        "src/infra/repositories/UserRepository.ts",
        "src/presentation/controllers/AuthController.ts",
        "src/presentation/routes/api.ts",
        "tests/unit/entities/User.spec.ts",
        "docker-compose.yml",
        ".env.example"
      ].join('\n')
    };
    updateText(presets[type]);
  };


  function updateText(newText) {
    setHistory(prev => [...prev.slice(-19), text]);
    setText(newText);
  }

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setText(previous);
  }, [history]);


  function copyScript() {
    const lines = text.split('\n').filter(l => l.trim() !== "");
    let script = "#!/bin/bash\n\n";
    lines.forEach(line => {
      if (line.includes('.')) {
        const parts = line.split('/'); parts.pop();
        const folderPath = parts.join('/');
        if (folderPath) script += `mkdir -p ${folderPath} && `;
        script += `touch ${line}\n`;
      } else script += `mkdir -p ${line}\n`;
    });
    navigator.clipboard.writeText(script);
    alert("Script bash copiado!");
  }

  function handleRename(oldPath, newName) {
    const parts = oldPath.split('/');
    parts[parts.length - 1] = newName;
    const newPath = parts.join('/');
    const lines = text.split('\n').map(l => l.startsWith(oldPath) ? l.replace(oldPath, newPath) : l);
    updateText(lines.join('\n'));
  }

  function handleMove(draggedPath, targetPath, isNew = false) {
    let lines = text.split('\n').filter(l => l.trim() !== "");
    if (isNew) {
      updateText([...lines, `${targetPath}/nova_pasta`].join('\n'));
      return;
    }
    const folderName = draggedPath.split('/').pop();
    const newFullPath = `${targetPath}/${folderName}`;
    const updatedLines = lines.map(line => line.startsWith(draggedPath) ? line.replace(draggedPath, newFullPath) : line);
    if (!updatedLines.some(l => l.startsWith(newFullPath))) updatedLines.push(newFullPath);
    updateText([...new Set(updatedLines)].join('\n'));
  }

  useEffect(() => setTree(parsePathToTree(text)), [text]);

  useEffect(() => {
    const handleKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'z') undo(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [undo]);


  return (
    <div className="canvas-container">
      <header className="header">
        <h1><LayoutTemplate size={24} color="#818cf8" /> Folder Architect Pro</h1>
        <div className="toolbar">
          <button onClick={undo} disabled={history.length === 0}><Undo2 size={16} /> Undo</button>
          <button onClick={() => updateText(initialText)}><RotateCcw size={16} /> Reset</button>
          <button onClick={copyScript} className="btn-copy"><Copy size={16} /> Copiar Script</button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <div className="card">
            <h3>Arquiteturas Prontas</h3>
            <div className="preset-group">
              <button className="btn-preset" onClick={() => loadPreset('next')}>
                <div className="preset-icon">N</div>
                <div className="preset-info">
                  <span>Next.js 14</span>
                  <small>App Router + TS</small>
                </div>
              </button>

              <button className="btn-preset" onClick={() => loadPreset('clean')}>
                <div className="preset-icon blue">C</div>
                <div className="preset-info">
                  <span>Clean Arch</span>
                  <small>Entities & UseCases</small>
                </div>
              </button>
            </div>
          </div>
          <div className="card">
            <h3>Novo Item</h3>
            <div className="draggable-new" draggable onDragStart={(e) => e.dataTransfer.setData("type", "NEW")}>
              <PlusSquare size={18} /> Arraste para o Workspace
            </div>
          </div>
          <div className="card">
            <h3>Raw Data Editor</h3>
            <div className="raw-data-container">
              <div className="raw-data-header">MANIFEST.TXT</div>
              <textarea value={text} onChange={(e) => updateText(e.target.value)} spellCheck="false" />
            </div>
          </div>
        </aside>

        <main className="preview-panel">
          <div className="root-label"><HardDrive size={14} /> WORKSPACE_ROOT</div>
          {tree.map((node, i) => (
            <FolderNode key={i} node={node} onMove={handleMove} onRename={handleRename} />
          ))}
        </main>
      </div>
    </div>
  );
}