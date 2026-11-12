# Start with Electron on Linux and macOS

Use Electron with React and TypeScript, electron-vite for development/builds, and npm with a committed lockfile. The initial risk is official subscription integration; a Node-based trusted main process aligns with the official local SDK while keeping credentials out of the renderer. Both Linux and macOS are required from the first shell; Linux checks here and a dual-platform CI matrix do not replace macOS device validation. Keep Electron out of renderer/domain imports so the desktop framework remains replaceable.
