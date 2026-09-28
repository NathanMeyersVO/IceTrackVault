# Build from source

**Windows** is the supported development and release target: CI produces Windows installers only. The codebase is OS-independent (Tauri + Rust), and building on macOS should be possible using the steps below, but macOS delivery is not a current priority. The author welcomes help from macOS developers who want to take on enabling and maintaining macOS—please open an issue or pull request on [GitHub](https://github.com/NathanMeyersVO/IceTrackVault).

## Prerequisites

### Node.js and Rust

- [Node.js](https://nodejs.org/) 22+
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain via rustup)

### Windows

```powershell
winget install Rustlang.Rustup
# Restart your terminal, then:
rustc --version
```

Also ensure [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) is installed (included on Windows 10/11).

### macOS

```bash
xcode-select --install
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustc --version
```

## Clone and run

```bash
git clone https://github.com/NathanMeyersVO/IceTrackVault.git
cd IceTrackVault
npm install
npm run tauri dev
```

Release installer:

```bash
npm run tauri build
```

- Windows output (official releases): `src-tauri/target/release/bundle/`
- macOS output (unofficial / contributor): on a Mac, `npm run tauri build` may produce `.app` / `.dmg` under the same `bundle/` path—not tested or shipped by the project today

If line endings look wrong after cloning, run `git add --renormalize .` once (see `.gitattributes` in the repo).

## Project structure

```
src/                 React UI
src-tauri/src/       Rust backend
  db.rs              SQLite project index + playlists
  scanner.rs         Folder scan + tag reading
  projects.rs        Managed project folders + manifests
  project_archive.rs Project .iceproject.zip export/import
  delivery/          Vendor delivery staging, preview, apply
  player.rs          Audio playback
```

## Documentation site

The VitePress site lives in `docs-site/`. Local preview:

```bash
cd docs-site
npm install
npm run docs:dev
```

### Screenshots in the guide

- Put PNG (or WebP) files in `docs-site/docs/public/screenshots/`.
- Reference them from Markdown with a root path, e.g. `![Alt text](/screenshots/my-screenshot.png)`.
- For a bordered image + smaller caption, wrap in `<figure class="screenshot-box">` with `<img … data-zoomable />` and `<figcaption>` (styles in `docs/.vitepress/theme/custom.css`).
- Images under `/screenshots/` render at a mid width on the page; **click to zoom** to full resolution (via `vitepress-plugin-lightbox` and `docs/.vitepress/theme/`).
- Pushes to `main` that touch `docs-site/` deploy the site through GitHub Actions (see repo `README`).
