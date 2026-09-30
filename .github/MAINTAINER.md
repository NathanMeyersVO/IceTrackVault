# Maintainer: protecting `main` on GitHub

One-time setup for [NathanMeyersVO/IceTrackVault](https://github.com/NathanMeyersVO/IceTrackVault). Contributors use forks (see [CONTRIBUTING.md](../CONTRIBUTING.md)); these settings keep **only you** able to push or merge to `main`.

## Collaborator access

- **Settings → Collaborators**: do not grant **Write** or **Maintain** to other developers. **Read** is optional; public forks work without any collaborator entry.

## Actions (fork pull requests)

- **Settings → Actions → General**
- Under **Fork pull request workflows**, choose **Require approval for first-time contributors** (or **Require approval for all outside collaborators**).

## Branch protection for `main`

**Settings → Branches → Add branch protection rule** (or **Rules → New ruleset** targeting `main`).

Enable:

| Setting | Value |
|--------|--------|
| Branch name pattern | `main` |
| Require a pull request before merging | On |
| Require review from Code Owners | On (requires [.github/CODEOWNERS](CODEOWNERS)) |
| Require status checks to pass | On — select **frontend** and **rust** after they appear from a PR (from [ci.yml](workflows/ci.yml)) |
| Require conversation resolution | On (recommended) |
| Do not allow bypassing the above settings | Off for administrators — so you can still push to `main` directly |
| Restrict who can push to matching branches | On — only **NathanMeyersVO** |
| Allow force pushes | Off |
| Allow deletions | Off |

After the first PR runs CI, return to the rule and tick the required status checks if they were not listed yet.

## Verify

- From another account (or a collaborator without push): open a fork PR → CI runs → **Merge** is not available without your credentials.
- As owner: `git push` to `main` on `github` remote still works (admin bypass).
- Merge a contributor PR when CI is green and you approve.

## Optional: `gh` CLI

If [GitHub CLI](https://cli.github.com/) is installed, you can inspect collaborators:

```bash
gh api repos/NathanMeyersVO/IceTrackVault/collaborators --jq '.[].login'
```

Branch protection is easiest to configure completely in the GitHub web UI because required status check IDs vary by repository.
