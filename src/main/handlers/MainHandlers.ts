import { ipcMain, BrowserWindow } from "electron";
import { editorSystem } from "../index";

/* 
Window Management Handlers
*/
ipcMain.on("minimise-window", (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize();
});

ipcMain.on("expand-window", (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.isMaximized() ? window.unmaximize() : window.maximize();
});

ipcMain.on("close-window", (event) => {
  BrowserWindow.fromWebContents(event.sender).close();
});

ipcMain.on("toggle-developer-tools", (event) => {
  event.sender.toggleDevTools();
});

// For debugging
ipcMain.on("debug", () => {
  console.log(editorSystem.getOpenedFilepaths());
});
