import { ipcMain, BrowserWindow, dialog } from "electron";
import { editorSystem } from "./index";

ipcMain.on("toggle-developer-tools", (event) => {
  event.sender.toggleDevTools();
});

/* 
Window Management Handler
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

/* 
File Handling Handlers
*/
ipcMain.on("get-opened-file", (event) => {
  event.sender.send("update-opened-file", editorSystem.getOpenedFile());
});

ipcMain.on("open-file", (event) => {
  dialog
    .showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [
        { name: "CellML 2.0 Document", extensions: ["cellml"] },
        { name: "All Files", extensions: ["*"] },
      ],
    })
    .then((result) => {
      if (!result.canceled) {
        editorSystem.openFiles(result.filePaths);
        console.log(editorSystem.getOpenedFile());
        event.sender.send("update-opened-file", editorSystem.getOpenedFile());
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on("close-file", (event, file) => {
  if (editorSystem.closeFile(file)) {
    event.sender.send("update-opened-file", editorSystem.getOpenedFile());
  }
});

ipcMain.on("debug", () => {
  console.log(editorSystem.getOpenedFile());
});
