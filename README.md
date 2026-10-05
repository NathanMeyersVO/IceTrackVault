# IceTrackVault

A desktop music player for **Windows** and **Linux**, with an iTunes-like layout for music coordinators. Manage **projects** (each stores audio under a `library/` folder in app data), browse **project tracks**, manage project playlists and taglists, apply **EMS download** updates (for US Figure Skating EMS projects), and play audio with a waveform view powered by [wavesurfer.js](https://wavesurfer.xyz/). Built with Tauri + React.

**Documentation & product site:** [nathanmeyersvo.github.io/IceTrackVault](https://nathanmeyersvo.github.io/IceTrackVault/)

## Platform

- **End users:** Windows and Linux—download from [GitHub Releases](https://github.com/NathanMeyersVO/IceTrackVault/releases).
- **macOS:** Not supported for delivery today. A local macOS build may be possible (`npm run tauri build` on a Mac), but that is not a current priority. The author welcomes help from any interested macOS developer who would like to take on enabling macOS—open an issue or PR on GitHub.

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

**Contributing:** fork the repo, use `feature/` or `bugfix/` branches on your fork, and open a PR to `main`. See [CONTRIBUTING.md](CONTRIBUTING.md).

- Windows output (releases): `src-tauri/target/release/bundle/` (`.msi` and `.exe`)
- Linux output (releases): `src-tauri/target/release/bundle/` (`.deb` and `.AppImage`)
- macOS output (unofficial): on a Mac, `.app` / `.dmg` under `bundle/` if a local build succeeds

End-user setup, usage, CLI tools, and release downloads are in the [docs site](https://nathanmeyersvo.github.io/IceTrackVault/guide/user-manual/).

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
  project_archive.rs Project .iceproject.zip export/import
  delivery/          Vendor delivery staging, preview, apply
  player.rs          Audio playback
docs-site/           VitePress documentation (GitHub Pages)
```
