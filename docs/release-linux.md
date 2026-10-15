# Releasing Linux packages

This fork builds and publishes Linux desktop packages (`.deb`, `.rpm`, Flatpak, AppImage) as GitHub Releases on this repository. Two workflows own that:

| Workflow | Trigger | What it does |
|---|---|---|
| [`release-linux.yml`](../.github/workflows/release-linux.yml) | push of a `v*` tag, or manual dispatch | Builds the packages at the tag's version and attaches them to the GitHub Release for that tag. |
| [`sync-upstream-linux.yml`](../.github/workflows/sync-upstream-linux.yml) | schedule (every 6h), or manual dispatch | Watches upstream `nexu-io/open-design`, and when a new stable version appears, merges it into this fork and pushes the `v<version>` tag that triggers the release above. |

Together they mean releases track upstream automatically: **a new upstream release becomes a Linux release here with the same version number.**

## Cutting a release manually

```bash
# 1. Make sure the tag exists at the commit you want to ship.
git tag v0.26.0
git push origin v0.26.0
# release-linux.yml runs automatically on the tag push.
```

Or run the workflow directly: **Actions → release-linux → Run workflow**, with `tag` set to an existing tag.

## How the upstream sync works

On each run `sync-upstream-linux.yml`:

1. Resolves the newest upstream stable tag (semver only — prereleases are ignored) with `git ls-remote`.
2. Skips if this fork already has a `v<version>` release or tag.
3. Merges the upstream tag into `main`. A merge conflict **fails the job** — packages are never published from a half-merged tree.
4. Pushes a `v<version>` tag pointing at the merge commit.

`release-linux.yml` then builds from that tag, so the shipped code is upstream's version plus this fork's Linux packaging delta.

**Turning it off.** Set the repository variable `AUTO_RELEASE_UPSTREAM` to `false` (Settings → Secrets and variables → Actions → Variables). The sync job is skipped; the release workflow still runs on tag pushes and manual dispatch.

## What the release workflow does

1. Builds AppImage + `.deb` + `.rpm` inside the `electronuserland/builder` container (glibc 2.27 baseline) via `tools-pack linux build --to all --containerized --portable`.
2. Builds the Flatpak bundle on the runner via `tools-pack linux build --to flatpak` (needs `flatpak-builder`).
3. Renames the artifacts to `open-design-<version>-linux-x64.{AppImage,deb,rpm,flatpak}`, generates a `.sha256` for each, and uploads them to the GitHub Release.

The upstream R2 / channel / Feishu release pipeline (`tools/release`, `release-stable.yml`, `release-beta.yml`, `release-prerelease.yml`) is intentionally untouched — this fork publishes to GitHub Releases only.

## Building locally

See [`install-linux.md`](install-linux.md#building-the-packages-yourself) and [`tools/pack/README.md`](../tools/pack/README.md#linux). Note that `.rpm` staging needs a disk-backed `TMPDIR` with several GB free — packaging a 2.5 GB unpacked app under a small `tmpfs` `/tmp` fails with `cpio: write failed`.
