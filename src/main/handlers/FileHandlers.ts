import { ipcMain, dialog } from "electron";
import { CellMLSpecification } from "src/main/data/EditorSystem";
import { editorSystem } from "../index";
import IPCChannel from "./IpcChannels";

/*
  Instruct system to create a new file and asynchronously notify the 
  renderer to update 
*/
ipcMain.on(IPCChannel.NEW_FILE, (event) => {
  editorSystem.newFile();
  event.sender.send(
    IPCChannel.RENDERER_UPDATE_OPENED_FILE,
    editorSystem.getOpenedFilepaths()
  );
});

/*
  Create new file using a template and asynchronously notify the 
  renderer to update 
*/
ipcMain.on(IPCChannel.NEW_FROM_TEMPLATE, (event, templateName) => {
  editorSystem.newFileFromTemplate(templateName);
  event.sender.send(
    IPCChannel.RENDERER_UPDATE_OPENED_FILE,
    editorSystem.getOpenedFilepaths()
  );
});

/*
  Instruct system to open an existing file via a dialog and asynchronously 
  notify the renderer to update the list of opened files
*/
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

/*
  Instruct system to close an opened file asynchronously notify the 
  renderer to update the list of opened files
*/
ipcMain.on(IPCChannel.CLOSE_FILE, (event, filepath) => {
  if (editorSystem.closeFile(filepath)) {
    event.sender.send(
      IPCChannel.RENDERER_UPDATE_OPENED_FILE,
      editorSystem.getOpenedFilepaths()
    );
  }
});

/*
  Instruct system to save an opened file. If the file is not unsaved (new file),
  a dialog will ask for save file location.
*/
ipcMain.on(IPCChannel.SAVE_FILE, (event, filepath) => {
  if (filepath == undefined) return;
  console.log(`Saving: ${filepath}`);
  if (!editorSystem.fileIsNew(filepath)) {
    editorSystem.saveFile(filepath);
  } else {
    dialog
      .showSaveDialog({
        defaultPath: ".",
        filters: [
          { name: "CellML 2.0 Document", extensions: ["cellml"] },
          { name: "All Files", extensions: ["*"] },
        ],
      })
      .then((result) => {
        if (!result.canceled) {
          editorSystem.saveFile(filepath, result.filePath);
          event.sender.send(
            IPCChannel.RENDERER_UPDATE_OPENED_FILE,
            editorSystem.getOpenedFilepaths()
          );
        }
      });
  }
});

/*
  Synchronous response to get an opened file's content
*/
ipcMain.on(IPCChannel.GET_FILE_CONTENT, (event, filepath) => {
  console.log(`Getting content for: ${filepath}`);
  event.returnValue = editorSystem.getFile(filepath)?.getContent();
});

/*
  Update an opened file's content with the one provided
*/
ipcMain.on(IPCChannel.UPDATE_FILE_CONTENT, (_, filepath, content) => {
  editorSystem.updateFileContent(filepath, content);
});

/*
  Return request to get an array of opened file paths
*/
ipcMain.handle(IPCChannel.GET_OPENED_FILEPATHS_ASYNC, async () => {
  return editorSystem.getOpenedFilepaths();
});

/*
  Get the state needed to be displayed for a file
*/
ipcMain.handle(IPCChannel.GET_FILE_STATE_ASYNC, (_, filepath) => {
  return editorSystem.getFile(filepath).getState();
});

ipcMain.on(IPCChannel.OPEN_CELLML_DOCUMENTATION, (event) => {
  editorSystem.openFile(CellMLSpecification);
  event.sender.send(
    IPCChannel.RENDERER_UPDATE_OPENED_FILE,
    editorSystem.getOpenedFilepaths()
  );
});
