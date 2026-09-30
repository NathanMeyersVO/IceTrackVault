# CLI tools

These commands run from a clone of the [IceTrackVault repository](https://github.com/NathanMeyersVO/IceTrackVault) (repo root).

## anonymize-project

Share a project or record demos without real names in tags or filenames. The tool copies audio into a subfolder under your project directory (default `DEMO_COPY/`), replaces **Track Title** with stable fake names, and renames file stems accordingly. Original files are not modified.

```powershell
cargo run --manifest-path src-tauri/Cargo.toml --bin anonymize-project -- `
  --project-dir "C:\path\to\your\project\library"
```

Use `--dry-run` to preview changes. Optional flags: `--output-subdir`, `--seed`.

## generate-demo-dataset

Build a fake meet folder for testing **Import EMS download** (event schedule plus tagged tracks under `tracks/`). Supply the real **Event Schedule** spreadsheet and a **track pool** folder tree. Each generated file copies a distinct pool track chosen by a random walk into leaf subfolders; only files **longer than 1 minute** (by default) are eligible. Some fake skaters are placed in two or three events.

```powershell
cargo run --manifest-path src-tauri/Cargo.toml --bin generate-demo-dataset -- `
  --schedule "D:\meets\event-schedule.xlsx" `
  --output "D:\drops\demo-meet" `
  --track-pool "D:\Music\pool" `
  --seed 42
```

Use `--dry-run` to preview paths. Tune roster size with `--competitors-min`, `--competitors-max`, and `--multi-event-2-weight` / `--multi-event-3-weight`. Override the length filter with `--min-duration-secs` (default `60` means strictly greater than one minute).
