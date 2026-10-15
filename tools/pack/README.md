# tools/pack

Local packaging control plane for Open Design.

`tools-pack` is the cross-platform packaging and smoke-lifecycle control plane. The macOS commands include:

- `tools-pack mac build --to all`
- `tools-pack mac build --to app|dmg|zip`
- `tools-pack mac build --to all --signed`
- `tools-pack mac build --to all --portable` for release artifacts that must not bake local tools-pack runtime paths
- `tools-pack mac install`
- `tools-pack mac start`
- `tools-pack mac stop`
- `tools-pack mac logs`
- `tools-pack mac uninstall`
- `tools-pack mac cleanup`

Build artifacts are namespace-scoped under `.tmp/tools-pack/out/mac/namespaces/<namespace>/`.
Public release bundles keep channel-distinct identities: `Open Design.app`, `Open Design Beta.app`,
`Open Design Prerelease.app`, or `Open Design Preview.app`. Local `tools-pack install` adds the developer
namespace so installs can coexist without affecting runtime data/log/cache paths.

Packaged runtime state is namespace-scoped under `.tmp/tools-pack/runtime/mac/namespaces/<namespace>/`:

- Packaged daemon storage is governed only by the root `AGENTS.md` section
  **Daemon data directory contract**. Before changing or documenting packaged
  storage propagation, you MUST read that section; this README MUST NOT
  restate it.
- `logs/` contains packaged process logs for `desktop`, `web`, and `daemon`.
- `runtime/` is the sidecar runtime base used by the packaged desktop/web/daemon process group.
- `cache/` is reserved for namespace-local packaged cache state.
- `user-data/` is the Electron/Chromium `userData` root, with `user-data/session/` used for `sessionData`.

Every packaged root registers the exact five-field sidecar stamp
(`channel / namespace / source / mode / app`) in its own argv. Direct OS
launches register during packaged startup; tools-pack launches receive the same
stamp through the sidecar launch atomic. No identity file participates in
discovery or ownership.

`tools-pack mac stop` scans exact argv stamps for desktop, Web, and daemon across
both tools-pack and direct packaged sources, requests private graceful teardown,
waits for every captured generation to exit, and then force-stops only the
still-matching process trees. Cleanup and uninstall refuse to remove artifacts
while any captured generation remains alive.

This keeps `stop` from killing processes outside the current namespace.

Packaged desktop also writes main-process lifecycle logs to `logs/desktop/latest.log` so Finder/manual launches are
diagnosable. This log is intentionally scoped to packaged desktop startup/shutdown/process errors and does not capture
web/renderer console output.

The packaged daemon path contract lives only in the root `AGENTS.md` section
**Daemon data directory contract**. Before changing or documenting packaged
path propagation, you MUST read that section; this README MUST NOT restate it.

Packaged desktop checks release metadata, verifies the downloaded artifact, and exposes update actions through desktop
IPC. Launcher-based builds prefer verified payload activation followed by relaunch; installer replacement remains the
fallback for artifact types and older builds that cannot apply a payload in place.

Electron-builder resources live under `tools/pack/resources/mac/`. The current logo is staged there as the mac icon/DMG
placeholder so future design-provided assets can replace the resource files without changing packaging code.

Local developer artifacts bake the tools-pack namespace runtime root so `tools-pack mac start/stop/logs/cleanup` can manage
them from the repo. Release artifacts use `--portable` so the installed app resolves namespace data/log/runtime/user-data
from the user's Electron `userData` root instead of the build machine's `.tmp` path.

### macOS compatibility notes

- `tools-pack mac build --portable --to zip` is the safest manual-install artifact for Intel Macs. This path was smoke-tested on macOS 12.7.6 Monterey on a 2015 Intel iMac and the app launched successfully from `/Applications`.
- Finder/manual launches on macOS may not inherit your shell-managed `PATH`. If packaged Open Design cannot detect agent CLIs that work in Terminal, expose those binaries to the GUI login environment or launch the packaged app from a shell session that already sees them.

## Windows

Local lifecycle commands:

- `tools-pack win build --to dir` for fast unpacked smoke builds.
- `tools-pack win build --to nsis` for installer builds.
- `tools-pack win build --to all` for both outputs.
- `tools-pack win install`
- `tools-pack win start`
- `tools-pack win inspect --expr "document.title"`
- `tools-pack win logs`
- `tools-pack win stop`
- `tools-pack win cleanup`
- `tools-pack win list`
- `tools-pack win reset`

Build artifacts are namespace-scoped under `.tmp/tools-pack/out/win/namespaces/<namespace>/`.
Packaged runtime state is namespace-scoped under `.tmp/tools-pack/runtime/win/namespaces/<namespace>/`.
`--to dir` may point `built-app.json` at an immutable cached `win-unpacked` executable while keeping
namespace-local config and runtime paths outside that cache entry.

## Linux

Local lifecycle commands:

- `tools-pack linux build --to all` (default; produces AppImage + `.deb` + `.rpm`)
- `tools-pack linux build --to appimage` (explicit AppImage)
- `tools-pack linux build --to deb` (Debian / Ubuntu / Mint / Pop!_OS package)
- `tools-pack linux build --to rpm` (Fedora / RHEL / openSUSE package)
- `tools-pack linux build --to flatpak` (Flatpak bundle; requires `flatpak-builder` on the host — see [Flatpak](#flatpak) below)
- `tools-pack linux build --to dir` (unpacked output for fast iteration)
- `tools-pack linux build --containerized` (run electron-builder inside `electronuserland/builder:base` Docker for a wider glibc compatibility target — requires Docker; incompatible with `--to flatpak`)
- `tools-pack linux build --to all --portable` (release artifacts that must not bake local tools-pack runtime paths)
- `tools-pack linux install`
- `tools-pack linux install --headless` (install the headless launcher script instead of the AppImage)
- `tools-pack linux start`
- `tools-pack linux start --headless` (start the headless entry — daemon + web, no Electron)
- `tools-pack linux stop`
- `tools-pack linux stop --headless` (stop a running headless process)
- `tools-pack linux inspect` (desktop status, eval, and screenshot for AppImage mode)
- `tools-pack linux inspect --headless` (status only)
- `tools-pack linux logs`
- `tools-pack linux uninstall`
- `tools-pack linux uninstall --headless`
- `tools-pack linux cleanup`
- `tools-pack linux cleanup --headless`

`--to all` covers the formats electron-builder builds natively in a single pass (AppImage, `.deb`, `.rpm`). `flatpak` is explicit-only because it needs `flatpak-builder`, which is not present on every build host; folding it into `all` would break plain local builds. `install`/`start`/`stop` remain AppImage- and headless-only; `.deb`/`.rpm`/Flatpak are build-only and install through the distro package manager or Flatpak.

Releasing these packages (and the upstream-tracking automation that builds them) is documented in [`docs/release-linux.md`](../../docs/release-linux.md).

Build artifacts are namespace-scoped under `.tmp/tools-pack/out/linux/namespaces/<namespace>/`. Packaged logs, sidecar runtime, cache, and Electron user-data are namespace-scoped under the tools-pack runtime root. Daemon storage follows only the root `AGENTS.md` **Daemon data directory contract**. Containerized build cache lives under `.tmp/tools-pack/.docker-cache/{electron,electron-builder}/`.

Local installs use XDG paths:

- AppImage: `~/.local/bin/Open-Design.<namespace>.AppImage`
- Menu entry: `~/.local/share/applications/open-design-<namespace>.desktop`
- Icon: `~/.local/share/icons/hicolor/512x512/apps/open-design-<namespace>.png`

The `<namespace>` suffix is unconditional so multiple developer namespaces can coexist on the same desktop. The `.desktop` file registers the `od://` scheme via `MimeType=x-scheme-handler/od;` and pre-sets `OD_PACKAGED_NAMESPACE` on the `Exec=` line so menu launches identify the correct namespace.

### Headless mode (`--headless`)

Headless mode targets environments without a display (WSL2, headless servers, CI) where Electron can't run. If you have a desktop, use the AppImage; if you're SSH'd into a machine or in WSL, use headless.

`--headless` makes `install`, `start`, `stop`, `uninstall`, and `cleanup` operate on the headless entry (`@open-design/packaged/dist/headless.mjs`) instead of the AppImage. Headless mode runs daemon + web without Electron.

- `install --headless` writes a shell launcher at `~/.local/bin/open-design-headless-<namespace>` that bakes in the namespace and resource paths. The launcher is self-contained, but the assembled app directory at those paths must remain in place — don't move it after install.
- `start --headless` launches through the sidecar atomic and waits up to 95s for private status readiness.
- `stop --headless` terminally stops the exact `mode=headless` argv stamp. The mode field keeps it disjoint from the AppImage desktop without identity files or public IPC paths.
- `inspect --headless` returns status only. Eval and screenshot require AppImage mode because there is no Electron renderer in headless mode.
- `uninstall --headless` removes the headless launcher after a safe stop.
- `cleanup --headless` stops the headless process before removing namespace output/runtime roots.

`logs` always reads `logs/desktop/latest.log` regardless of mode, so headless output is visible via `tools-pack linux logs`.

### AppImage launch mode (FUSE caveat)

`tools-pack linux start` always spawns the AppImage with `--appimage-extract-and-run`. Smoke testing on Ubuntu 24.04 and Arch Linux showed that direct FUSE-mounted AppImage launches make Node module loads (Express, better-sqlite3, etc.) slow enough that the daemon sidecar consistently failed to clear `apps/packaged`'s 35-second startup timeout. Extract-and-run unpacks the AppImage into `/tmp/appimage_extracted_<hex>/` and exec's the inner Electron from there, bypassing FUSE and getting daemon boot in under 5 seconds — roughly an order-of-magnitude improvement.

**Implication for end-users:** if launching the installed AppImage manually (not via `tools-pack linux start`), pass `--appimage-extract-and-run` yourself, or rely on a desktop launcher / `appimage-launcher` daemon that handles extract-and-run automatically.

### Optional system tools

`tools-pack linux install` and `tools-pack linux uninstall` invoke `update-desktop-database` and `gtk-update-icon-cache` as best-effort post-hooks. Either tool being absent (`iconCache: "missing"` in the output) is harmless — the icon and menu entry still work, the cache just isn't refreshed. Install via your distro:

- Arch / CachyOS: `sudo pacman -S desktop-file-utils gtk-update-icon-cache`
- Debian / Ubuntu: `sudo apt install desktop-file-utils gtk-update-icon-cache`
- Fedora: `sudo dnf install desktop-file-utils gtk-update-icon-cache`

`libfuse2` is needed for FUSE-mounted AppImage launch (the default mode when running an AppImage directly without `--appimage-extract-and-run`). `tools-pack linux start` always uses extract-and-run and bypasses FUSE entirely, so it does not need `libfuse2`. Most modern distros ship `libfuse2` by default; older Ubuntu LTS hosts may need `sudo apt install libfuse2t64` (or `libfuse2` on pre-24.04).

### Sandbox / chrome-sandbox

Electron 41 on Linux requires `kernel.unprivileged_userns_clone=1` (default on Arch, Ubuntu 24+, Debian 12+) or AppImage's `--no-sandbox` fallback. Most modern distros need no extra setup.

### Distro compatibility target

AppImages built natively on a rolling distro (e.g., Arch / CachyOS) link against recent glibc and may not run on stable distros (Ubuntu 22.04, Debian 12). Use `--containerized` to build against the `electronuserland/builder:base` baseline (Ubuntu 18.04 / glibc 2.27), which is the compatibility target for release AppImages rather than a guarantee for every Linux distribution.

Verified smoke coverage in this repository currently includes:

- Main PR CI: packaged Linux smoke is intentionally outside the main CI gate.
- Release lane: Ubuntu GitHub-hosted runner, containerized AppImage build plus Xvfb AppImage runtime smoke when the Linux release lane is enabled.
- Manual AppImage behavior used to choose `--appimage-extract-and-run`: Ubuntu 24.04 and Arch Linux.

### Package formats

Linux desktop apps in this space split across formats: VS Code ships `.deb` + `.rpm` + Snap; Discord ships AppImage + `.deb`; Slack ships `.deb` + `.rpm`; Cursor and Obsidian ship AppImage. This fork ships **AppImage + `.deb` + `.rpm` + Flatpak**:

- **AppImage** — one artifact covering the widest glibc-compatible target, no distro repositories required, and it integrates cleanly with the namespace-scoped install layout.
- **`.deb` / `.rpm`** — native electron-builder targets, so they come for free with the same build. They install through the distro package manager and register `od://` via the packaged desktop entry.
- **Flatpak** — a sandboxed, distro-agnostic bundle, built by `flatpak-builder` from the unpacked `dir` output (electron-builder has no flatpak target).

### Flatpak

`tools-pack linux build --to flatpak` requires `flatpak-builder` plus the matching `org.freedesktop.Platform` / `org.freedesktop.Sdk` runtimes from Flathub:

```bash
sudo apt install flatpak flatpak-builder            # Debian / Ubuntu
flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install -y flathub org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08
```

The build first produces electron-builder's `linux-unpacked` output, then renders `tools/pack/resources/linux/io.opendesign.OpenDesign.yml` (`@@APP_ID@@` / `@@EXECUTABLE@@` / `@@SOURCE@@` / `@@VERSION@@`) and runs `flatpak-builder` + `flatpak build-bundle`. The bundle lands next to the other artifacts as `Open-Design.<namespace>.flatpak`.

**Electron-in-Flatpak caveats:** the Chromium setuid sandbox is unusable inside the Flatpak sandbox, so the generated `/app/bin/open-design` launcher passes `--no-sandbox`. The sandbox also restricts which host coding-agent CLIs the packaged daemon can see; the manifest grants `--filesystem=home` so projects and home-directory CLIs work, but an agent installed elsewhere (e.g. a system path) may need a wider `--filesystem` entry in the manifest.

### Out of scope (later phases)

- AppImage signing (`--signed`) and `.deb`/`.rpm` repository signing — deferred pending a GPG key infrastructure decision and a user-facing verification flow design (no ETA).
- AppImage auto-update feed (`latest-linux.yml`) — the linux electron-builder config has no `publish` block wired, so a generated feed would point users at a feed that never updates. Tracked alongside signing.
- Snap — deferred until there is demand and an owner for store/repository plumbing.
- apt/dnf repositories and a Flathub listing — this fork publishes `.deb`/`.rpm`/`.flatpak` artifacts to GitHub Releases; hosting them in distro repositories or Flathub is a separate ownership decision.
- Full Linux AppImage/Flatpak and headless packaged smoke remain outside the main PR gate; run the applicable tools-pack validation manually or through a release lane when Linux packaging changes.

`--to dmg` is manual-install DMG output only. Any builder-generated updater metadata such as `latest-mac.yml` or
`.blockmap` files is treated as scratch and cleaned from the builder directory; release-beta generates the authoritative
`latest-mac.yml` feed during release asset preparation, pointing at the update ZIP.
