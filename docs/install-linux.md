# Installing OpenDesign on Linux

OpenDesign ships a native Linux desktop app as four package formats — `.deb`, `.rpm`, Flatpak, and AppImage. This guide covers downloading, installing, first-run setup, updating, and uninstalling each of them.

The packages are published on this fork's [GitHub Releases](https://github.com/mitexleo/open-design-linux/releases). Every release includes a `.sha256` checksum next to each artifact.

> Prefer no desktop app? You can also run OpenDesign from a [source checkout](../QUICKSTART.md) or with [Docker](install-guide.md).

## Requirements

- **Architecture:** x86_64 (`amd64`).
- **glibc:** 2.27 or newer. The packages are built against the `electronuserland/builder` baseline, so they run on Ubuntu 20.04+, Debian 11+, Fedora 33+, Arch Linux, and openSUSE Leap 15.3+.
- **A coding-agent CLI on `PATH`** to power the design loop (`claude`, `codex`, `cursor-agent`, `opencode`, `copilot`, …). Without one, use the BYOK proxy or OpenDesign Cloud.
- **Electron/Chromium sandbox:** Electron 41 needs unprivileged user namespaces (`kernel.unprivileged_userns_clone=1`, default on Arch, Ubuntu 24+, and Debian 12+). The AppImage and Flatpak launchers fall back to `--no-sandbox` when they are unavailable.

## Download

Download the artifacts for your release from [GitHub Releases](https://github.com/mitexleo/open-design-linux/releases). The file names are:

```
open-design-<version>-linux-x64.deb
open-design-<version>-linux-x64.rpm
open-design-<version>-linux-x64.flatpak
open-design-<version>-linux-x64.AppImage
```

Each has a matching `.sha256`. Verify before installing:

```bash
sha256sum -c open-design-<version>-linux-x64.deb.sha256
```

## Debian / Ubuntu (`.deb`)

Works on Debian, Ubuntu, Linux Mint, Pop!\_OS, elementary, Kali, and derivatives.

```bash
sudo apt install ./open-design-<version>-linux-x64.deb
```

`apt` resolves the Electron runtime dependencies automatically. If you use `dpkg`, install them yourself:

```bash
sudo dpkg -i open-design-<version>-linux-x64.deb
sudo apt-get -f install
```

Installation registers the `od://` protocol handler and a desktop entry, so OpenDesign appears in your application menu.

**Uninstall:** `sudo apt remove open-design`

## Fedora / RHEL / openSUSE (`.rpm`)

Works on Fedora, RHEL, CentOS Stream, Rocky Linux, AlmaLinux, and openSUSE.

```bash
sudo dnf install ./open-design-<version>-linux-x64.rpm
# or
sudo zypper install ./open-design-<version>-linux-x64.rpm
```

**Uninstall:** `sudo dnf remove open-design` (or `sudo zypper remove open-design`)

## Flatpak

The Flatpak bundle is sandboxed and distro-agnostic. It needs the `org.freedesktop.Platform//24.08` runtime from Flathub.

```bash
flatpak remote-add --if-not-exists --user flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install --user flathub org.freedesktop.Platform//24.08
flatpak install --user ./open-design-<version>-linux-x64.flatpak
flatpak run io.open-design.OpenDesign
```

**Uninstall:** `flatpak uninstall --user io.open-design.OpenDesign`

### Flatpak sandbox notes

- **Agent CLI detection.** OpenDesign launches the coding-agent CLIs it finds on `PATH`. The Flatpak sandbox exposes your home directory, so agents installed under `~` (nvm, `~/.local/bin`, Homebrew on Linux, …) work. An agent installed only in a system path may not be visible; install it under your home directory, or use the AppImage/`.deb`/`.rpm` instead.
- **Filesystem access.** The bundle is granted `--filesystem=home` so it can read and write your projects. Projects outside your home directory are not visible to the sandbox.
- **Sandbox.** The Chromium setuid sandbox cannot run inside the Flatpak sandbox, so the app launches with `--no-sandbox`.

## AppImage

The AppImage is a single portable file with no install step.

```bash
chmod +x open-design-<version>-linux-x64.AppImage
./open-design-<version>-linux-x64.AppImage
```

FUSE is needed to run an AppImage directly. If FUSE is unavailable (containers, some hardened kernels), either install `libfuse2`/`libfuse2t64`, or run with the built-in extract fallback:

```bash
./open-design-<version>-linux-x64.AppImage --appimage-extract-and-run
```

[AppImageLauncher](https://github.com/TheAssassin/AppImageLauncher) integrates the file into your application menu automatically.

**Uninstall:** delete the AppImage file.

## First run

On first launch OpenDesign:

1. Detects every coding-agent CLI it can find on `PATH` (see the [platform compatibility table](../README.md#platform-compatibility)).
2. Loads the bundled skills, design templates, and design systems.
3. Lets you type a brief in the entry view.

You can also install OpenDesign into a coding agent — Claude Code, Codex, Cursor, Copilot, and more — as an MCP server:

```bash
od mcp install <agent>
```

## Updating

Download the newer artifact and reinstall it the same way (`.deb`/`.rpm` upgrades in place; reinstall the Flatpak bundle with `flatpak install`). AppImage users replace the file.

The Linux packages do not currently ship an in-app auto-updater feed, so updates are manual downloads.

## Troubleshooting

- **`Open Design` does not start, or the window is blank.** Electron needs unprivileged user namespaces; if they are disabled, run the AppImage with `--no-sandbox` (the Flatpak bundle already does).
- **No coding agents detected.** Confirm the CLI runs from a shell (`claude --version`) and that it is on the `PATH` the app inherits. Desktop/menu launches may not inherit a shell-managed `PATH`; on Flatpak, see the sandbox note above.
- **AppImage fails to mount.** Install `libfuse2` (`libfuse2t64` on Ubuntu 24.04+), or use `--appimage-extract-and-run`.
- **`od` resolves to the system octal-dump utility.** Some systems already have `/usr/bin/od`. Open **Settings → MCP server** in the app and copy the absolute-path snippet instead of typing bare `od`.

## Building the packages yourself

The packaging lives in `tools/pack`. From a source checkout:

```bash
corepack pnpm install
pnpm tools-pack linux build --to all          # AppImage + .deb + .rpm
pnpm tools-pack linux build --to flatpak      # Flatpak bundle (needs flatpak-builder)
pnpm tools-pack linux build --to all --containerized   # glibc 2.27 baseline via Docker
```

See [`tools/pack/README.md`](../tools/pack/README.md#linux) for the full command surface.
