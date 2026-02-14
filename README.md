🏗️ Folder Architect Pro

Visual project scaffolding made simple. Design your project structure with an intuitive drag-and-drop interface and generate automation scripts instantly.

➜ View Live Project ([link](https://folder-arch-pro.vercel.app/))

Features

    Drag & Drop Workspace: Move folders and files intuitively.

    Smart Presets: One-click setups for Next.js (App Router) and Clean Architecture.

    Dark Mode UI: A professional, sleek dashboard designed for developers.

    Instant Scaffolding: Export a full Bash script (mkdir -p && touch) to build your project in seconds.

    Smart Icons: Automatic detection for .js, .ts, .json, and .css files.

    Real-time Manifest: Edit the raw text and watch the tree update instantly.

    History Support: Full Undo/Redo (Ctrl+Z) functionality.

 Tech Stack

    React.js (Functional Components & Hooks)

    Lucide React (Beautiful, consistent iconography)

    CSS3 (Custom Dark Mode & Grid Design)

 How to use locally

1. Clone the repo
git clone https://github.com/willianctti/folder-arch-pro.git

2. Install dependencies
npm install

3. Run the development server
npm start
 Automation Script Example

When you click "Copiar Script", the app generates a script like this:

#!/bin/bash
mkdir -p src/components && touch src/components/Header.jsx
mkdir -p api/routes && touch api/routes/user.ts

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

Built with ❤️ by Willian
