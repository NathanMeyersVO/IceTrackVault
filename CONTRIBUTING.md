# Contributing to IceTrackVault

Thank you for helping improve IceTrackVault. This project uses a **fork-and-pull-request** workflow: you do not need write access to the upstream repository.

## Workflow

1. **Fork** [NathanMeyersVO/IceTrackVault](https://github.com/NathanMeyersVO/IceTrackVault) on GitHub.
2. **Clone your fork** and add the upstream remote if you like:
   ```bash
   git clone https://github.com/YOUR_USER/IceTrackVault.git
   cd IceTrackVault
   git remote add upstream https://github.com/NathanMeyersVO/IceTrackVault.git
   ```
3. **Create a branch** on your fork using one of these prefixes:
   - `feature/<short-description>` — new functionality or larger changes
   - `bugfix/<short-description>` — bug fixes and small corrections
4. **Develop and test** locally (see [development guide](https://nathanmeyersvo.github.io/IceTrackVault/guide/development.html) or `docs-site/docs/guide/development.md` in the repo).
5. **Push** the branch to your fork and open a **pull request into `main`** on the upstream repo.
6. Wait for **CI** to pass and for **maintainer review**. Only the repository owner merges changes to `main`.

## Pull request checklist

- Fill out the PR template (summary and test plan).
- Keep PRs focused; split unrelated changes when possible.
- Run before opening or updating a PR:
  - On **Linux**, install system dependencies from the [development guide](docs-site/docs/guide/development.md#linux) before `npm run tauri dev` or `cargo test`.
  - `npm test`
  - `npm run build`
  - `cargo test --manifest-path src-tauri/Cargo.toml --lib`

## What you cannot do (by design)

- **Push directly to `main`** on the upstream repository — branch protection limits that to the maintainer.
- **Merge your own PR** into upstream `main` unless you are the repository owner.

## Questions

Open a [GitHub issue](https://github.com/NathanMeyersVO/IceTrackVault/issues) for bugs, ideas, or questions before large changes.
