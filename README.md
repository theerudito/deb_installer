# deb_installer

Desktop app for Ubuntu that installs or reinstalls a local Debian package (`.deb`) with Wails, Go, React/Vite, and Tailwind CSS.

The app does not collect or store sudo passwords. On Linux it runs:

```bash
pkexec apt install --reinstall -y /path/to/package.deb
```

`pkexec` delegates authentication to the OS through polkit.

## Requirements

- Ubuntu or a compatible Linux desktop for installation.
- `apt`.
- `pkexec`/polkit available for graphical privilege escalation.
- Go, Node.js/npm, and Wails CLI for development.

If `pkexec` is unavailable, install polkit/pkexec or run the equivalent command manually:

```bash
sudo apt install --reinstall -y /path/to/package.deb
```

## Live Development

```bash
wails dev
```

This starts Wails and the Vite dev server.

## Building

```bash
wails build
```

Build Linux release artifacts on Ubuntu. Cross-building a Wails desktop app from Windows to Linux may require additional native dependencies and is not the recommended path.

## Frontend Commands

```bash
cd frontend
npm install
npm run build
```

## Backend Verification

```bash
gofmt -w app.go main.go
go test ./...
```
