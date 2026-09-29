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

Release builds sign Windows binaries and installers during `tauri build` using **Azure Artifact Signing** and **`artifact-signing-cli`**, configured in the Release workflow (see [`.github/workflows/release.yml`](https://github.com/NathanMeyersVO/IceTrackVault/blob/main/.github/workflows/release.yml)).

### GitHub Actions secrets

| Secret | Purpose |
| --- | --- |
| `AZURE_CLIENT_ID` | App registration (service principal) client ID |
| `AZURE_TENANT_ID` | Microsoft Entra tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Subscription that contains the Artifact Signing account |
| `AZURE_SIGNING_ENDPOINT` | Account endpoint (e.g. `https://westus2.codesigning.azure.net`) |
| `AZURE_SIGNING_ACCOUNT` | Artifact Signing account name |
| `AZURE_SIGNING_PROFILE` | Certificate profile name |

Do **not** store `AZURE_CLIENT_SECRET`; the workflow uses **OIDC federated credentials** (`id-token: write` + `azure/login@v2`).

### Azure setup checklist

1. Artifact Signing account, endpoint, and certificate profile (Public Trust identity verification completed).
2. App registration with a **federated credential** whose subject matches tag releases, e.g. `repo:NathanMeyersVO/IceTrackVault:ref:refs/tags/v*`.
3. **Artifact Signing Certificate Profile Signer** role assigned to that service principal on the signing account.

After a release, verify signatures on a Windows machine:

```powershell
Get-AuthenticodeSignature .\path\to\*-setup.exe
```

Further reading: [Tauri — Windows code signing (Azure Artifact Signing)](https://v2.tauri.app/distribute/sign/windows/), [Azure OIDC from GitHub Actions](https://learn.microsoft.com/en-us/azure/developer/github/connect-from-azure).
