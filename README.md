# 🎮 Can I Run This

**Can I Run This** is a cross-platform desktop app built with **React, Vite**, and **Tauri**.
It helps users check whether their computer can run specific games available on **Steam** by comparing their system specifications with the game’s minimum requirements.

---

## 🚀 Overview

This app provides a fast and intuitive way for gamers to:

- Browse games directly from Steam.
- View system requirements (CPU, GPU, RAM, etc.).
- Compare the requirements against their own computer’s specs.
- Make smarter download or purchase decisions.

Built with:

- 🧩 **Frontend:** React + Vite
- ⚙️ **Backend Layer:** Rust (via Tauri) for native performance
- 🪟 **Cross-platform:** Available for **Windows** and **macOS**

---

## 🕹️ Steam API Integration

The app uses the **Steam Web API** to fetch game information dynamically:

- Game titles, descriptions, and store images.
- System requirements and available platforms.
- Automatically cached locally into a `games_cache.json` file for faster performance.

This cache reduces API calls and improves the offline experience.

---

## 💻 Installation

### 🪟 Windows

1. Go to the [Releases](https://github.com/melvnl/CanIRunThis.exe/releases) page.
2. Download the latest file ending with:
3. Run the installer — Windows may ask for confirmation since this is an unsigned app.
4. Once installed, you can launch **Can I Run This** from your Start Menu or Desktop.

---

### 🍎 macOS

1. Go to the [Releases](https://github.com/melvnl/CanIRunThis.exe/releases).
2. Download the `.dmg` or `.app` file for macOS (coming soon if not yet published).
3. Drag the app into your `Applications` folder.
4. If macOS blocks the app, go to:

---

## 🔧 Future Improvements

Planned or potential enhancements include:

- 🕒 **Automated Game Cache Updates:**
  Use a GitHub Actions cron workflow to periodically refresh `games_cache.json` (e.g., daily or weekly).
- 💬 **User Customization:**
  Allow users to manually input their system specs.
- 🔍 **Better Search & Filtering:**
  Filter by genre, popularity, or minimum system requirements.

---

## 📦 Development Setup (Optional)

If you want to build the app locally:

```bash
# Clone the repository
git clone https://github.com/melvnl/CanIRunThis.exe.git
cd CanIRunThis.exe

# Install dependencies
npm ci

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```
