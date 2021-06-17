
import { ipcMain, dialog } from "electron";
import { editorSystem } from "../index";

/* 
File Handling Handlers
*/
ipcMain.on("get-opened-files", (event) => {
    event.sender.send("update-opened-file", editorSystem.getOpenedFiles());
  });
  
  ipcMain.on("get-opened-files-sync", (event) => {
    event.returnValue = editorSystem.getOpenedFiles();
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
    console.log(`Getting: ${filepath}`);
    event.returnValue = editorSystem.getFile(filepath)?.getContent();
  });
  
  ipcMain.on("save-file", (_, filepath) => {
    console.log(`Saving: ${filepath}`);
    editorSystem.saveFile(filepath);
  });
  
  ipcMain.on('update-file-content', (_, filepath, content) => {
    editorSystem.updateFileContent(filepath, content);
  })