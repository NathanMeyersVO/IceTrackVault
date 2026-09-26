# Getting started

IceTrackVault is available on **Windows** (installers on GitHub Releases). macOS is not offered as a supported platform today; see [Build from source](./development) if you are a contributor exploring a local macOS build.

## Install

1. Open [Releases](https://github.com/NathanMeyersVO/IceTrackVault/releases) and download the latest installer (`.msi` and/or `.exe`, depending on the build).
2. Run the installer. Unsigned builds may show a SmartScreen warning until the app is code-signed.

## First steps in the app

1. Open **Project → Projects…** and create a project (name + application), or **Import EMS download…** from a folder of EMS downloads (ZIP archives and/or an event schedule spreadsheet).
2. Open the project. IceTrackVault scans audio and loads playlists and taglists from `library/trackvault.json`.
3. Double-click a track (or select and press play) to start playback.

See [Using the app](./usage) for export, collections, and EMS apply workflows.

## Stack (overview)

- **Backend:** Rust (Tauri 2) — scanning, SQLite, playback, waveform peaks
- **Frontend:** React, TypeScript, Tailwind CSS, Zustand, [wavesurfer.js](https://wavesurfer.xyz/)

Developers building from source should read [Build from source](./development).
