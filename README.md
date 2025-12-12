<div align="center">

# 🖥️ mbm-os

**A macOS-inspired desktop environment in your browser**

A creative lab for web experiments, interactive tools, and polished UI components — built with Next.js 16, React 19, and modern web technologies.

<!-- TODO: Add hero screenshot -->

![mbm-os Desktop](https://via.placeholder.com/1200x675/1a1a2e/ffffff?text=📷+Add+Screenshot+Here)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

[Live Demo](https://bechir.xyz) · [Report Bug](https://github.com/MohamedBechirMejri/mbm-os/issues) · [Request Feature](https://github.com/MohamedBechirMejri/mbm-os/issues)

</div>

---

## ✨ Features

### 🎮 Built-in Applications

| App                   | Description                                                                       |
| --------------------- | --------------------------------------------------------------------------------- |
| **Finder**            | File browser with virtual filesystem, sidebar navigation, and multiple view modes |
| **Terminal**          | Interactive shell with custom commands, GitHub integration, and Easter eggs       |
| **Safari**            | Tab-based browser simulation with working URL bar                                 |
| **Calculator**        | Functional calculator with keyboard support                                       |
| **Solitaire**         | Classic card game with drag-and-drop mechanics                                    |
| **Sketch Pad**        | Drawing canvas with brush tools and export                                        |
| **Image Converter**   | Convert images between formats, generate favicons/app icons                       |
| **Shadow Playground** | Visual CSS box-shadow generator                                                   |
| **GPU Water Lab**     | WebGPU water simulation experiment                                                |
| **Million Row Grid**  | Virtualized data grid demo (1M+ rows)                                             |
| **App Store**         | Browse and "install" additional apps                                              |
| **Spotify**           | Music player integration                                                          |

### 🎨 Desktop Experience

- **Window Management** — Draggable, resizable windows with minimize/maximize/close
- **Dock** — App launcher with smooth animations
- **Menu Bar** — System menus, clock, and status icons
- **Launchpad** — Grid view of all applications
- **Login Screen** — Authentic macOS-style login with Touch ID hint
- **Theming** — Dark mode optimized UI with glassmorphism effects

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph UI["UI Layer"]
        Desktop["Desktop Screen"]
        Login["Login Screen"]
        Boot["Boot Screen"]
    end

    subgraph WindowSystem["Window Management"]
        WM["Window Manager<br/>(XState)"]
        Dock["Dock"]
        MenuBar["Menu Bar"]
        Launchpad["Launchpad"]
    end

    subgraph Apps["Applications"]
        Finder
        Terminal
        Safari
        Calculator
        Solitaire
        ImageConverter["Image Converter"]
        ShadowPlayground["Shadow Playground"]
        SketchPad["Sketch Pad"]
        MillionRowGrid["Million Row Grid"]
        GPUWaterLab["GPU Water Lab"]
    end

    subgraph State["State Management"]
        Zustand["Zustand Stores"]
        XState["XState Machines"]
        TanStack["TanStack Query"]
    end

    subgraph Backend["Backend"]
        API["Next.js API Routes"]
        DB["PostgreSQL<br/>(Drizzle ORM)"]
    end

    Desktop --> WM
    WM --> Apps
    Apps --> State
    State --> Backend

    style Desktop fill:#1a1a2e,color:#fff
    style WM fill:#16213e,color:#fff
    style Apps fill:#0f3460,color:#fff
    style State fill:#533483,color:#fff
    style Backend fill:#e94560,color:#fff
```

### Tech Stack

| Layer           | Technology                          |
| --------------- | ----------------------------------- |
| **Framework**   | Next.js 16 (App Router, Turbopack)  |
| **UI**          | React 19, Tailwind CSS 4, Radix UI  |
| **State**       | Zustand, XState, TanStack Query     |
| **Animation**   | Framer Motion                       |
| **3D/Graphics** | Three.js, React Three Fiber, WebGPU |
| **Database**    | PostgreSQL, Drizzle ORM             |
| **Tooling**     | TypeScript 5.9, Biome, Bun          |

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0+)
- [PostgreSQL](https://www.postgresql.org/) (optional, for Million Row Grid demo)

### Installation

```bash
# Clone the repository
git clone https://github.com/MohamedBechirMejri/mbm-os.git
cd mbm-os

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to see the desktop.

### Environment Variables

```bash
# Required for Million Row Grid demo
DATABASE_URL="postgresql://user:password@host:5432/database"

# Optional
LAUNCH_EDITOR="code"
REACT_EDITOR="code"
```

---

## 📁 Project Structure

```
mbm-os/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (terminal, github)
│   └── page.tsx           # Main entry point
├── components/
│   ├── screens/           # Boot, Login, Desktop screens
│   │   └── desktop/
│   │       └── components/
│   │           ├── apps/  # All applications
│   │           ├── dock/  # Dock component
│   │           └── menu-bar/
│   └── ui/                # Shared UI components
├── lib/                   # Utilities and stores
│   └── db/               # Database schema
├── public/               # Static assets
└── drizzle/              # Database migrations
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **GPL-3.0 License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Mohamed Bechir Mejri**

- Portfolio: [bechir.xyz](https://bechir.xyz)
- GitHub: [@MohamedBechirMejri](https://github.com/MohamedBechirMejri)
- Twitter: [@0x4D424D](https://twitter.com/0x4D424D)
- LinkedIn: [MohamedBechirMejri](https://www.linkedin.com/in/MohamedBechirMejri/)

---

<div align="center">

⭐ **Star this repo if you find it interesting!** ⭐

</div>
