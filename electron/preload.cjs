// Preload script for Electron
// This script runs before the renderer process and can expose
// specific Node.js APIs to the renderer in a secure way

const { contextBridge } = require("electron");

// Expose platform info to the renderer
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
});
