import { ipcMain, BrowserWindow, dialog } from "electron";
import { editorSystem } from "./index";

ipcMain.on("toggle-developer-tools", (event) => {
  event.sender.toggleDevTools();
});

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

/* 
File Handling Handlers
*/
ipcMain.on("get-opened-file", (event) => {
  event.sender.send("update-opened-file", editorSystem.getOpenedFilepaths());
});

ipcMain.on("get-opened-file-sync", (event) => {
  event.returnValue = editorSystem.getOpenedFilepaths();
});

// Instruct system to open file and send an asynchronous response
// with currently opened files
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
        event.sender.send(
          "update-opened-file",
          editorSystem.getOpenedFilepaths()
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on("close-file", (event, filepath) => {
  if (editorSystem.closeFile(filepath)) {
    event.sender.send("update-opened-file", editorSystem.getOpenedFilepaths());
  }
});

// Synchronous response to get an opened file's content
ipcMain.on("get-file-content", (event, filepath) => {
  console.log(`Getting: ${filepath}`)
  event.returnValue = editorSystem.getFile(filepath)?.getContent();
});

ipcMain.on("debug", () => {
  console.log(editorSystem.getOpenedFilepaths());
});
