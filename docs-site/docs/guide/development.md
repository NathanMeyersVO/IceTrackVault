# Build from source

## Prerequisites

### All platforms

- [Node.js](https://nodejs.org/) 18+
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

- Windows output: `src-tauri/target/release/bundle/`
- macOS output: build on macOS for `.app` / `.dmg`

If line endings look wrong after cloning, run `git add --renormalize .` once (see `.gitattributes` in the repo).

## Project structure

```
src/                 React UI
src-tauri/src/       Rust backend
  db.rs              SQLite project index + playlists
  scanner.rs         Folder scan + tag reading
  projects.rs        Managed project folders + manifests
  project_archive.rs Project .tvproject.zip export/import
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
