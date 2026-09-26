# IceTrackVault

A cross-platform desktop music player (Windows and macOS) with an iTunes-like layout. Manage **projects** (each stores audio under a `library/` folder in app data), browse **project tracks**, manage project playlists and taglists, apply **EMS download** updates (for US Figure Skating EMS projects), and play audio with a waveform view powered by [wavesurfer.js](https://wavesurfer.xyz/).

**Documentation & product site:** [nathanmeyersvo.github.io/IceTrackVault](https://nathanmeyersvo.github.io/IceTrackVault/)

## Stack

- **Backend:** Rust (Tauri 2) — project scanning, SQLite, audio playback, waveform peaks
- **Frontend:** React, TypeScript, Tailwind CSS, Zustand, wavesurfer.js

## Quick start (developers)

```bash
git clone https://github.com/NathanMeyersVO/IceTrackVault.git
cd IceTrackVault
npm install
npm run tauri dev
```

Build a release installer: `npm run tauri build`

- Windows output: `src-tauri/target/release/bundle/`
- macOS output: build on macOS for `.app` / `.dmg`

End-user setup, usage, CLI tools, and release downloads are in the [docs site](https://nathanmeyersvo.github.io/IceTrackVault/guide/getting-started).

## Git remotes

- **`github`** — [github.com/NathanMeyersVO/IceTrackVault](https://github.com/NathanMeyersVO/IceTrackVault) (primary for CI, Pages, and releases)
- **`origin`** — local bare backup on your machine (optional mirror: `git push origin main`)

If line endings look wrong after cloning, run `git add --renormalize .` once (see [`.gitattributes`](.gitattributes)).

## Docs site (maintainers)

```bash
cd docs-site
npm install
npm run docs:dev
```

Pushes to `main` that touch `docs-site/` deploy via [`.github/workflows/pages.yml`](.github/workflows/pages.yml). In the repo **Settings → Pages**, set the source to **GitHub Actions** (one-time).

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
docs-site/           VitePress documentation (GitHub Pages)
```
