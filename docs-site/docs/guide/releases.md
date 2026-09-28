# Download & releases

IceTrackVault ships **Windows-only** installers. macOS builds are not published or maintained as part of releases today.

Pre-built **Windows** installers are published as [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) assets:

**[github.com/NathanMeyersVO/IceTrackVault/releases](https://github.com/NathanMeyersVO/IceTrackVault/releases)**

1. Download the latest installer (`.msi` and/or `.exe` setup, depending on what the build produced).
2. Unsigned builds may trigger a SmartScreen warning until the app is code-signed.

The source is Tauri-based and a local macOS build may be possible, but that is not a current priority. The author welcomes help from any interested macOS developer who would like to take on enabling macOS—see [Build from source](./development) and [GitHub](https://github.com/NathanMeyersVO/IceTrackVault).

## Maintainers — ship a new version

1. Bump the same version in `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and `package.json`.
2. Commit on `main` and push.
3. Tag and push the tag (triggers the Release workflow):

   ```powershell
   git tag v0.16.0
   git push github v0.16.0
   ```

4. In GitHub **Actions**, wait for the **Release** workflow to finish.
5. Open the new **draft** release under **Releases**, verify the Windows assets, then **Publish release**.

Use tag names like `v0.16.0` that match the app version `0.16.0`.
