<h1 align="center">OpenDesign for Linux</h1>

<h3 align="center">Native <code>.deb</code> · <code>.rpm</code> · Flatpak · AppImage packages for OpenDesign — built from upstream releases</h3>

<p align="center">
  <a href="https://github.com/mitexleo/open-design-linux/releases"><img alt="latest release" src="https://img.shields.io/github/v/release/mitexleo/open-design-linux?style=flat&color=blueviolet&label=release" /></a>
  <a href="LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=flat" /></a>
  <a href="https://github.com/mitexleo/open-design-linux/releases"><img alt="Linux packages: .deb, .rpm, Flatpak, AppImage" src="https://img.shields.io/badge/Linux-.deb%20%7C%20.rpm%20%7C%20Flatpak%20%7C%20AppImage-blueviolet.svg?style=flat&logo=linux&logoColor=white" /></a>
</p>

<p align="center">
  <img src="docs/assets/readme-hero-design-agent.webp" alt="OpenDesign — the collaborative AI design agent workspace, packaged for Linux as .deb, .rpm, Flatpak, and AppImage" width="100%" />
</p>

> ### 📦 This is a packaging repository, not the OpenDesign project
>
> This repo builds and publishes **Linux desktop packages** for [**OpenDesign**](https://github.com/nexu-io/open-design).
> It does **not** develop the app. Features, documentation, source code, issue tracking, and
> contributions all live upstream at [**nexu-io/open-design**](https://github.com/nexu-io/open-design).
>
> Looking for the product itself — docs, plugins, design systems, how to contribute — go upstream.
> Looking for a `.deb`, `.rpm`, Flatpak, or AppImage you can install on Linux? You are in the right place.

---

## What is OpenDesign?

OpenDesign is an open-source, local-first **AI design agent workspace**. You start with a brief, and a
coding-agent CLI already on your machine (Claude Code, Codex, Cursor, Copilot, OpenCode, Kimi, and
20+ more) generates prototypes, slide decks, dashboards, images, and motion graphics that follow a
brand's `DESIGN.md`. Everything runs locally, projects live in SQLite, and artifacts preview in a
sandboxed iframe.

This repository's job is narrow: **take each stable upstream release and ship installable Linux
packages for it**, so you don't need Node, pnpm, or a source checkout.

## What this repository is (and is not)

| | This repository | Upstream: [nexu-io/open-design](https://github.com/nexu-io/open-design) |
|---|---|---|
| Provides | `.deb`, `.rpm`, Flatpak, and AppImage builds for Linux | The app's source, features, docs, and design assets |
| Releases | Linux packages tagged `v<version>` | Product releases tagged `open-design-v<version>` |
| Maintains | Build + release automation, packaging fixes | Product development, plugins, design systems |
| Report here | Packaging / install / launch problems | App bugs, feature requests, discussions |
| License | Apache-2.0 | Apache-2.0 |

It tracks upstream automatically: every 6 hours a scheduled workflow looks for a new upstream stable
release, merges it into this fork, and rebuilds the Linux packages at the matching version.

## Download

**[Latest Linux release →](https://github.com/mitexleo/open-design-linux/releases)**

Each release ships four artifacts for `x86_64`, every one with a `.sha256` checksum:

| Format | Best for | File |
|---|---|---|
| **`.deb`** | Debian, Ubuntu, Linux Mint, Pop!\_OS, elementary, Kali | `open-design-<version>-linux-x64.deb` |
| **`.rpm`** | Fedora, RHEL, CentOS Stream, Rocky, AlmaLinux, openSUSE | `open-design-<version>-linux-x64.rpm` |
| **Flatpak** | Any distro with Flatpak (sandboxed, distro-agnostic) | `open-design-<version>-linux-x64.flatpak` |
| **AppImage** | Any distro (portable, no install step) | `open-design-<version>-linux-x64.AppImage` |

```bash
# download the latest release, all formats
gh release download --repo mitexleo/open-design-linux --pattern 'open-design-*'
```

## Install

### Debian / Ubuntu — `.deb`

```bash
sudo apt install ./open-design-<version>-linux-x64.deb
```

`apt` resolves the Electron runtime dependencies. With `dpkg`: `sudo dpkg -i ./…deb && sudo apt-get -f install`.
Installing registers the app in your application menu and the `od://` protocol handler.

**Uninstall:** `sudo apt remove open-design`

### Fedora / RHEL / openSUSE — `.rpm`

```bash
sudo dnf install ./open-design-<version>-linux-x64.rpm      # Fedora / RHEL / Rocky / Alma
sudo zypper install ./open-design-<version>-linux-x64.rpm   # openSUSE
```

**Uninstall:** `sudo dnf remove open-design`

### Flatpak

```bash
flatpak remote-add --if-not-exists --user flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install --user flathub org.freedesktop.Platform//24.08
flatpak install --user ./open-design-<version>-linux-x64.flatpak
flatpak run io.opendesign.OpenDesign
```

Installing the bundle adds **Open Design** to your application menu. The sandbox is granted
`--filesystem=home`, so projects and home-directory CLI tools work; a coding agent installed only in
a system path may need a wider `--filesystem` entry.

**Uninstall:** `flatpak uninstall --user io.opendesign.OpenDesign`

### AppImage

```bash
chmod +x open-design-<version>-linux-x64.AppImage
./open-design-<version>-linux-x64.AppImage
```

If FUSE is unavailable, run with `--appimage-extract-and-run` or install `libfuse2`/`libfuse2t64`.

**Uninstall:** delete the file.

### Requirements

- **Architecture:** x86_64 (`amd64`).
- **glibc:** 2.35 or newer — packages are built inside the `electronuserland/builder` (Ubuntu 22.04)
  baseline. That covers Ubuntu 22.04+, Debian 12+, Fedora 35+, Arch Linux, and current openSUSE.
- **A coding-agent CLI on `PATH`** (`claude`, `codex`, `cursor-agent`, `opencode`, …) to drive the
  design loop. Without one, use the app's BYOK proxy or OpenDesign Cloud.
- **Electron sandbox:** unprivileged user namespaces enabled, or the built-in `--no-sandbox`
  fallback (the AppImage and Flatpak launchers already pass it).

### Verify a download

```bash
sha256sum -c open-design-<version>-linux-x64.rpm.sha256
```

## Screenshots

<table>
<tr>
<td width="50%" valign="top">
<img src="docs/screenshots/product-tour/home-workspace-2026-09-30-220844.png" alt="OpenDesign home screen on Linux with the prototype composer and example prompts" /><br/>
<sub><b>Home</b> — start from a brief or an example.</sub>
</td>
<td width="50%" valign="top">
<img src="docs/screenshots/product-tour/studio-prototype-2026.webp" alt="Building a website prototype in OpenDesign Studio on Linux" /><br/>
<sub><b>Prototypes</b> — build and refine with your agent and a live preview.</sub>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<img src="docs/screenshots/product-tour/studio-slides-2026.png" alt="A slide deck open in OpenDesign Studio on Linux" /><br/>
<sub><b>Slides</b> — decks, speaker notes, and export.</sub>
</td>
<td width="50%" valign="top">
<img src="docs/screenshots/product-tour/studio-image-2026.webp" alt="A generated image previewed in OpenDesign Studio on Linux" /><br/>
<sub><b>Images</b> — generate, inspect, and download visual assets.</sub>
</td>
</tr>
</table>

## How Linux releases are produced

```
upstream nexu-io/open-design
        │  new stable tag: open-design-v<version>
        ▼
sync-upstream-linux.yml   (every 6h, or manual)
        │  merge the upstream tag into this fork, publish tag v<version>
        ▼
release-linux.yml
        │  AppImage + .deb + .rpm (containerized), Flatpak, checksums
        ▼
GitHub Release v<version>
```

- Packages are built from the merged tree — the upstream release plus this fork's packaging changes.
- `.deb`, `.rpm`, and the AppImage are built inside the `electronuserland/builder` container for a
  consistent glibc baseline; the Flatpak is built with `flatpak-builder`.
- Details: [`docs/release-linux.md`](docs/release-linux.md).

## Build a package yourself

```bash
git clone https://github.com/mitexleo/open-design-linux.git
cd open-design-linux
corepack enable && pnpm install

pnpm tools-pack linux build --to all       # AppImage + .deb + .rpm
pnpm tools-pack linux build --to flatpak   # needs flatpak-builder
```

See [`tools/pack/README.md`](tools/pack/README.md#linux) and [`docs/install-linux.md`](docs/install-linux.md).
Note: `.rpm` staging needs a disk-backed `TMPDIR` with several GB free.

## Repository map

| Path | Purpose |
|---|---|
| `.github/workflows/release-linux.yml` | Builds and publishes the four Linux formats on a `v*` tag or by manual dispatch |
| `.github/workflows/sync-upstream-linux.yml` | Watches upstream stable releases and triggers a build at the matching version |
| `tools/pack/` | Packaging control plane (`tools-pack linux build`) |
| `docs/install-linux.md` | Per-distro install, first run, uninstall, troubleshooting |
| `docs/release-linux.md` | Release automation and the manual release flow |

## Upstream, credit, and license

The application is built entirely by the OpenDesign authors and contributors:
**[nexu-io/open-design](https://github.com/nexu-io/open-design)**. This repository only adds Linux
packaging and release automation. Product documentation, roadmap, plugins, and design systems live
upstream — please send feature requests and app bugs there.

Licensed under **Apache-2.0**. Bundled skills, templates, and design systems keep their own
licenses (for example `design-templates/guizang-ppt/` MIT, `design-templates/html-ppt/` MIT,
`skills/web-clone/` MIT).
