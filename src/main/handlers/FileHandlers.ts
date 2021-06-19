import { ipcMain, dialog } from "electron";
import { editorSystem } from "../index";
import IPCChannel from "./IpcChannels";

/* 
File Handling Handlers
*/

// Instruct system to open file and send an asynchronous response
// with currently opened files
ipcMain.on(IPCChannel.OPEN_FILE, (event) => {
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
          IPCChannel.RENDERER_UPDATE_OPENED_FILE,
          editorSystem.getOpenedFilepaths()
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on(IPCChannel.CLOSE_FILE, (event, filepath) => {
  if (editorSystem.closeFile(filepath)) {
    event.sender.send(
      IPCChannel.RENDERER_UPDATE_OPENED_FILE,
      editorSystem.getOpenedFilepaths()
    );
  }
});

ipcMain.on(IPCChannel.SAVE_FILE, (_, filepath) => {
  console.log(`Saving: ${filepath}`);
  editorSystem.saveFile(filepath);
});

// Synchronous response to get an opened file's content
ipcMain.on(IPCChannel.GET_FILE_CONTENT, (event, filepath) => {
  console.log(`Getting: ${filepath}`);
  event.returnValue = editorSystem.getFile(filepath)?.getContent();
});

ipcMain.on(IPCChannel.UPDATE_FILE_CONTENT, (_, filepath, content) => {
  editorSystem.updateFileContent(filepath, content);
});

ipcMain.on(IPCChannel.GET_OPENED_FILEPATHS, (event) => {
  event.sender.send(
    IPCChannel.RENDERER_UPDATE_OPENED_FILE,
    editorSystem.getOpenedFilepaths()
  );
});

// Async version of GET_OPENED_FILEPATHS that returns a Promise<any>
ipcMain.handle(IPCChannel.GET_OPENED_FILEPATHS_ASYNC, async () => {
  return editorSystem.getOpenedFilepaths();
});
