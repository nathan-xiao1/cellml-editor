import { ipcMain, BrowserWindow, dialog } from "electron";
import { editorSystem } from "../index";
import IPCChannel from "./IpcChannels";

/* 
Window Management Handlers
*/
ipcMain.on(IPCChannel.MINIMISE_WINDOW, (event) => {
  BrowserWindow.fromWebContents(event.sender).minimize();
});

ipcMain.on(IPCChannel.EXPAND_WINDOW, (event) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  window.isMaximized() ? window.unmaximize() : window.maximize();
});

ipcMain.on(IPCChannel.CLOSE_WINDOW, (event) => {
  BrowserWindow.fromWebContents(event.sender).close();
});

ipcMain.on(IPCChannel.TOGGLE_DEVELOPER_TOOLS, (event) => {
  event.sender.toggleDevTools();
});

ipcMain.on(IPCChannel.FORCE_RELOAD_WINDOW, (event) => {
  event.sender.reloadIgnoringCache();
});

ipcMain.handle(IPCChannel.ACTION_CONFIRM, (_, message) => {
  return dialog.showMessageBoxSync(null, {
    type: "question",
    buttons: ["No", "Yes"],
    message: message,
  });
});

// For debugging
ipcMain.on("debug", () => {
  console.log(editorSystem.getOpenedFiles().length)
  editorSystem.getOpenedFilesState().forEach((file) => console.log(file));
  // console.log();
});
