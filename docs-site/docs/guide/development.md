# Build from source

**Windows** and **Linux** are the supported development and release targets. CI builds and tests the Rust backend on both, and tagged releases publish Windows installers plus a Linux `.deb` and `.AppImage`. Building on macOS should be possible using the steps below, but macOS delivery is not a current priority. The author welcomes help from macOS developers who want to take on enabling and maintaining macOS—please open an issue or pull request on [GitHub](https://github.com/NathanMeyersVO/IceTrackVault).

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

### Linux

Debian and Ubuntu need the Tauri system libraries (WebKitGTK 4.1 and ALSA):

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev \
  patchelf pkg-config libasound2-dev
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustc --version
```

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

- Windows output (official releases): `src-tauri/target/release/bundle/` (`.msi` and `.exe`)
- Linux output (official releases): `src-tauri/target/release/bundle/` (`.deb` and `.AppImage`; RPM is not built)
- macOS output (unofficial / contributor): on a Mac, `npm run tauri build` may produce `.app` / `.dmg` under the same `bundle/` path—not tested or shipped by the project today

If line endings look wrong after cloning, run `git add --renormalize .` once (see `.gitattributes` in the repo).

### Git shows many files modified (Windows / Cygwin)

On **NTFS** (Windows paths and Cygwin `/cygdrive/...`), Git may report permission-only diffs (`git diff --summary` shows `mode change`) even when file contents are unchanged. Cygwin often marks the working tree executable (`100755`) while the repository uses normal `100644` modes.

In this clone, run once (stored in `.git/config`, shared by Windows Git and Cygwin Git in the same folder):

```bash
git config core.filemode false
```

Then `git status` should be clean. Use one Git per clone when possible; if you mix Cygwin and Windows Git on the same tree, keep `core.filemode` set to `false` for that repo.

## Contributing changes upstream

IceTrackVault uses a **fork and pull request** workflow. You do not need write access to the main repository.

1. Fork [IceTrackVault on GitHub](https://github.com/NathanMeyersVO/IceTrackVault).
2. Create a branch on your fork named `feature/<description>` or `bugfix/<description>`.
3. Push to your fork and open a pull request targeting **`main`** on the upstream repo.
4. Ensure CI passes; the maintainer reviews and merges.

Full details: [CONTRIBUTING.md](https://github.com/NathanMeyersVO/IceTrackVault/blob/main/CONTRIBUTING.md) in the repository root.

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
- Images under `/screenshots/` render at **natural size** (never upscaled), capped at **720px** wide, **centered** when narrower than the content column; **click to zoom** to full resolution (via `vitepress-plugin-lightbox` and `docs/.vitepress/theme/`).
- Pushes to `main` that touch `docs-site/` deploy the site through GitHub Actions (see repo `README`).
