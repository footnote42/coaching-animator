# Rugby Animation Tool

A web-based tactical animation tool for rugby coaches to create, save, and share animated play diagrams. Now with online features including cloud storage, public gallery, and community features.

## ✨ Features

### Core Animation Tools
- **Position Players**: Drag players, balls, cones, and markers onto a rugby field
- **Multi-Frame Animation**: Create smooth animations by adding multiple frames
- **Video Export**: Export your animations as .webm video files to share via WhatsApp or email
- **Save & Load**: Save your tactical diagrams as JSON files for later use
- **Multiple Sports**: Switch between Rugby Union, Rugby League, Soccer, and American Football fields
- **Annotations**: Draw arrows and lines to show movement patterns and tactical instructions
- **Ghost Mode**: See previous frame positions while setting up the next frame
- **Auto-Save**: Automatic crash recovery with 30-second auto-save
- **Offline-First**: No account needed, all data stays on your device

### Online Platform Features
- **User Accounts**: Free registration with 50 animation storage limit
- **Cloud Storage**: Save animations to the cloud and access from any device
- **Public Gallery**: Browse and discover animations shared by coaches worldwide
- **Social Features**: Upvote animations, share links, and community interaction
- **Guest Mode**: Try the tool instantly with 10-frame limit (no signup required)
- **Content Reporting**: Help keep the community safe with reporting tools
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

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

The application will open at http://localhost:3000/

### Online Platform Setup (Optional)
For cloud features, create a Supabase project and configure environment variables:
```bash
# Copy environment template
cp .env.local.example .env.local

# Add your Supabase credentials
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-anon-key
# FRONTEND_URL=http://localhost:3000
```

The core animation tool works fully offline. Online features require Supabase configuration.

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
| **Firefox** | ✅ Fully supported | ✅ 60 FPS | ✅ WebM format |
| **Safari** | ✅ Supported | ✅ Supported | ⚠️ Limited |

> **Recommendation**: Use Chrome or Edge for full feature support, especially for video export.

---

## 📝 Known Limitations

- **50-Frame Limit**: Projects can have a maximum of 50 frames (per FR-FRM-01)
- **Export Format**: Videos are exported as .webm only (limited Safari support)
  - **Workaround**: Use Chrome or Edge for best video export compatibility
- **Max Animation Duration**: 5 minutes per export (300,000ms total frame duration per FR-EXP-04)
- **No Cloud Sync**: All data is stored locally in your browser (offline-first design)
- **Auto-Save Quota**: Auto-save limited to ~5MB (browser LocalStorage limit)
  - **Behavior**: If quota exceeded, app displays warning toast and prompts manual save
- **Safari Limitations**: 
  - MediaRecorder API has limited support → Video export may be unstable
  - Recommend using Chrome/Edge for full functionality
- **Entity Limits**: While not enforced, performance is optimal with ≤30 entities per frame
- **Annotation Limits**: Maximum 100 annotations per frame (per data-model.md validation rules)

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
- **Next.js 14** - React framework with App Router
- **React 18** + TypeScript
- **Konva** - HTML5 Canvas library for smooth rendering
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Modern utility-first styling
- **Supabase** - Authentication, database, and storage
- **Serwist** - PWA service worker for offline support

### Project Structure
```
├── app/              # Next.js App Router pages and API routes
│   ├── (auth)/       # Authentication pages
│   ├── (legal)/      # Legal pages (Terms, Privacy, Contact)
│   ├── admin/        # Admin dashboard
│   ├── api/          # API endpoints
│   ├── gallery/      # Public gallery pages
│   ├── my-gallery/   # Personal gallery page
│   ├── app/          # Animation tool (main application)
│   ├── page.tsx      # Landing page
│   └── layout.tsx    # Root layout
├── components/       # React components
│   ├── AnimationCard.tsx
│   ├── Editor.tsx
│   ├── SaveToCloudModal.tsx
│   └── [other components]
├── lib/              # Shared utilities and Supabase clients
├── src/              # Core animation components (from Vite)
├── specs/            # Feature specifications and tasks
└── supabase/         # Database migrations
```

---

## 🤝 Contributing

This project follows a spec-driven development workflow. Current work focuses on the online platform migration:

**Current Status**: Development complete (111/111 tasks)
- ✅ All P1 stories complete (US1-US3: Auth, Save, Public Gallery)
- ✅ All P2 stories complete (US4-US7: Guest Mode, Upvotes, Reports, Landing)
- ✅ P3 stories complete (US8-US9: Admin moderation and Remix)
- 🔄 In Progress: Production deployment (Phase 13 - 25 remaining tasks)

**Development Documents**:
1. Check `/specs/003-online-platform/spec.md` for current feature specifications
2. Review `/specs/003-online-platform/tasks.md` for implementation progress
3. See `/specs/003-online-platform/PROGRESS.md` for session history

**Submit Issues**: Reference specific User Stories (US1-US9) or Task IDs (T001-T111) when reporting bugs.

---

## 🚀 Deployment

### Prerequisites
- Node.js 18+ installed
- Supabase project (for online features)
- Vercel account (recommended for hosting)

### Production Setup

1. **Environment Variables**
   ```bash
   # Required for production
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   FRONTEND_URL=https://your-domain.com
   ```

2. **Build and Deploy**
   ```bash
   # Build for production
   npm run build
   
   # Deploy to Vercel (recommended)
   npx vercel
   ```

3. **Database Setup**
   - Run migrations in Supabase dashboard
   - Set up Row Level Security policies
   - Configure authentication providers

### Known Issues

- **Static Generation**: Current build has issues with static generation - use dynamic rendering for now
- **Video Export**: Requires Chrome/Edge for best compatibility
- **Mobile Safari**: Limited video export support

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
