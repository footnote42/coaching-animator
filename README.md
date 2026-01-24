# Rugby Animation Tool

A browser-based tactical animation tool for rugby coaches to create and share play diagrams.

## ✨ Features

- **Position Players**: Drag players, balls, cones, and markers onto a rugby field
- **Multi-Frame Animation**: Create smooth animations by adding multiple frames
- **Video Export**: Export your animations as .webm video files to share via WhatsApp or email
- **Save & Load**: Save your tactical diagrams as JSON files for later use
- **Multiple Sports**: Switch between Rugby Union, Rugby League, Soccer, and American Football fields
- **Annotations**: Draw arrows and lines to show movement patterns and tactical instructions
- **Ghost Mode**: See previous frame positions while setting up the next frame
- **Auto-Save**: Automatic crash recovery with 30-second auto-save
- **Offline-First**: No account needed, all data stays on your device

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Modern web browser (Chrome 90+, Edge 90+, or Firefox)

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd coaching-animator

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will open at http://localhost:5173/

---

## 📖 Usage Guide

### Creating Your First Animation

1. **Add Players**: Click "Attack Player" or "Defense Player" buttons in the sidebar to add team members
2. **Position Entities**: Drag players to their starting positions on the field
3. **Add Labels**: Double-click a player to add a jersey number or name
4. **Create Next Frame**: Click the "+" button in the timeline to add a new frame
5. **Set End Positions**: Reposition players to their target positions in Frame 2
6. **Play Animation**: Press the Play button (or Spacebar) to see your animation
7. **Export Video**: Click "Export Video" to save as a .webm file
8. **Save Project**: Click "Save Project" to download a .json file you can load later

### Advanced Features

#### Ball Possession
1. Add a ball entity using the "Ball" button
2. Select the ball
3. Use the "Possession" dropdown in Entity Properties to assign it to a player
4. The ball will follow that player during animation

#### Annotations
1. Click "Draw Arrow" or "Draw Line" in the Entity Palette
2. Click and drag on the canvas to create your annotation
3. Right-click annotations to delete them
4. Set frame visibility in Entity Properties to show annotations only on specific frames

#### Ghost Mode
- Enable "Show Ghosts" to see semi-transparent previous frame positions
- Helps align players for realistic movement sequences

#### Duration Control
- Each frame has a duration slider (default: 2 seconds)
- Adjust to create faster or slower transitions between frames
- Range: 100ms to 10,000ms

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Spacebar** | Play / Pause animation |
| **Delete** | Remove selected entity |
| **Escape** | Deselect entity |
| **Ctrl+S** (Cmd+S on Mac) | Save project |
| **Left Arrow** | Previous frame |
| **Right Arrow** | Next frame |

---

## 🌐 Browser Support

| Browser | Drag & Drop | Animation | Video Export |
|---------|-------------|-----------|--------------|
| **Chrome 90+** | ✅ Fully supported | ✅ 60 FPS | ✅ WebM format |
| **Edge 90+** | ✅ Fully supported | ✅ 60 FPS | ✅ WebM format |
| **Firefox** | ✅ Fully supported | ✅ 60 FPS | ⚠️ Limited |
| **Safari** | ✅ Supported | ✅ Supported | ❌ Not supported |

> **Recommendation**: Use Chrome or Edge for full feature support, especially for video export.

---

## 📝 Known Limitations

- **50-Frame Limit**: Projects can have a maximum of 50 frames
- **Export Format**: Videos are exported as .webm only (not supported in Safari)
- **Max Animation Duration**: 5 minutes per export
- **No Cloud Sync**: All data is stored locally in your browser
- **Auto-Save Quota**: Auto-save limited to ~5MB (browser LocalStorage limit)

---

## 🎨 Design Philosophy

The Rugby Animation Tool follows the **Tactical Clubhouse Aesthetic**:
- **Pitch Green** (#1A3D1A) and **Tactics White** (#F8F9FA) color scheme
- Sharp corners (no rounded edges) for a professional, tactical feel
- Monospace fonts for data fields (frame counts, timecode)
- Rugby-first terminology and workflow

---

## 🏉 Tips for Rugby Coaches

### Creating Lineout Plays
1. Use the "Rugby Union" field
2. Add 7-8 attack players for your lineout jumpers and lifters
3. Add 2-3 defense players for opposition
4. Use cones to mark the 5m and 15m lines
5. Add the ball and assign possession to your thrower
6. Annotate with arrows to show lifting calls and throws

### Creating Backline Moves
1. Position 7 attack players across the field (halfback, flyhalf, centers, wingers, fullback)
2. Add the ball to the halfback
3. Create 3-4 frames showing the passing sequence
4. Use annotations to highlight running lines and switches
5. Adjust frame durations to match real-time play speed

### Sharing with Players
1. Export your animation as .webm
2. Share via WhatsApp, email, or your team's messaging app
3. Players can watch on any device that supports video playback
4. Consider using screen recording software to convert to MP4 for iOS devices

---

## 🛠️ Technical Details

### Built With
- **React 18** + TypeScript
- **Konva** - HTML5 Canvas library for smooth rendering
- **Zustand** - Lightweight state management
- **Tailwind CSS v4** - Modern utility-first styling
- **Vite** - Lightning-fast build tool

### Project Structure
```
src/
├── components/       # UI components (Canvas, Sidebar, Timeline)
├── hooks/           # Custom React hooks (animation, export, auto-save)
├── store/           # Zustand state management
├── types/           # TypeScript definitions
├── constants/       # Design tokens, validation rules
└── utils/           # Helper functions
```

---

## 🤝 Contributing

This project is part of a spec-driven development workflow. If you find bugs or have feature requests:
1. Check `/specs/001-rugby-animation-tool/spec.md` for the authoritative specification
2. Review `/specs/001-rugby-animation-tool/tasks.md` for planned work
3. Submit issues with reference to specific Functional Requirements (e.g., FR-CAN-04)

---

## 📄 License

[Specify your license here]

---

## 🙏 Acknowledgments

- Built for rugby coaches who want simple, effective tools
- Inspired by the need for offline, privacy-first tactical diagramming
- Designed to work on any device with a modern browser

---

**Made with ❤️ for coaches who love the tactical side of rugby**
