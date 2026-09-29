# Download & releases

IceTrackVault ships **Windows-only** installers. macOS builds are not published or maintained as part of releases today.

Pre-built **Windows** installers are published as [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) assets:

**[github.com/NathanMeyersVO/IceTrackVault/releases](https://github.com/NathanMeyersVO/IceTrackVault/releases)**

1. Download the latest installer (`.msi` and/or `.exe` setup, depending on what the build produced).
2. Installers are Authenticode-signed via [Azure Artifact Signing](https://learn.microsoft.com/en-us/azure/artifact-signing/overview). Microsoft SmartScreen may still show a warning on brand-new releases until the certificate and files build reputation.

The source is Tauri-based and a local macOS build may be possible, but that is not a current priority. The author welcomes help from any interested macOS developer who would like to take on enabling macOS—see [Build from source](./development) and [GitHub](https://github.com/NathanMeyersVO/IceTrackVault).

## Maintainers — ship a new version

1. Bump the same version in `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, and `package.json`.
2. Commit on `main` and push.
3. Tag and push the tag (triggers the Release workflow):

   ```powershell
   git tag v0.16.1
   git push github v0.16.1
   ```

4. In GitHub **Actions**, wait for the **Release** workflow to finish.
5. Open the new **draft** release under **Releases**, verify the Windows assets, then **Publish release**.

Use tag names like `v0.16.1` that match the app version `0.16.1`.

## Maintainers — code signing (Azure OIDC)

Release builds sign Windows binaries and installers during `tauri build` using **Azure Artifact Signing**, **`azure/login` (OIDC)**, and [`scripts/sign-windows.ps1`](https://github.com/NathanMeyersVO/IceTrackVault/blob/main/scripts/sign-windows.ps1) (signtool + the Artifact Signing client DLL), configured in the Release workflow (see [`.github/workflows/release.yml`](https://github.com/NathanMeyersVO/IceTrackVault/blob/main/.github/workflows/release.yml)).

### GitHub Actions secrets

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | App registration (service principal) client ID |
| `AZURE_TENANT_ID` | Microsoft Entra tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Subscription that contains the Artifact Signing account |
| `AZURE_SIGNING_ENDPOINT` | Account endpoint (e.g. `https://westus2.codesigning.azure.net`) |
| `AZURE_SIGNING_ACCOUNT` | Artifact Signing account name |
| `AZURE_SIGNING_PROFILE` | Certificate profile name |

Do **not** store `AZURE_CLIENT_SECRET`. The workflow uses **OIDC federated credentials** (`id-token: write` + `azure/login@v2`). The signing script relies on that `az` session; it does **not** use `artifact-signing-cli`, which always requires a client secret and performs its own `az login --service-principal`.

The Release job uses the GitHub **environment** named `release` so OIDC works for every `v*` tag without adding a new Entra federated credential per tag.

### Azure and GitHub setup checklist

1. Artifact Signing account, endpoint, and certificate profile (Public Trust identity verification completed).
2. GitHub repo **environment** `release` (Settings → Environments).
3. App registration with a **federated credential** whose subject matches that environment:

   `repo:NathanMeyersVO/IceTrackVault:environment:release`

   Tag-scoped subjects (e.g. `ref:refs/tags/v0.16.1`) are only for one-off tests; routine releases use the environment subject above.
4. **Artifact Signing Certificate Profile Signer** role assigned to that service principal on the signing account.
5. **Reader** (or higher) on the **subscription** that hosts the Artifact Signing account, assigned to the same service principal. Without this, `azure/login` may fail with “No subscriptions found” even when OIDC and federated credentials are correct. The Release workflow also sets `allow-no-subscriptions: true` on the login step to avoid intermittent subscription-enumeration failures when `subscription-id` is provided.

After a release, verify signatures on a Windows machine:

```powershell
Get-AuthenticodeSignature .\path\to\*-setup.exe
```

Further reading: [Tauri — Windows code signing (Azure Artifact Signing)](https://v2.tauri.app/distribute/sign/windows/), [Azure OIDC from GitHub Actions](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure).
