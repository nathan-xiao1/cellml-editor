import { ipcMain } from "electron";
import IPCChannel from "IPCChannels";

import { editorSystem, library } from "../index";

ipcMain.on(IPCChannel.LIBRARY_GET_COMPONENTS, (event) => {
  library
    .getComponents()
    .then((components) =>
      event.reply(IPCChannel.RENDERER_UPDATE_COMPONENT, components)
    );
});

ipcMain.on(IPCChannel.LIBRARY_ADD_COMPONENT, (event, component) => {
  Promise.all([library.addComponent(component), library.getComponents()]).then(
    (results) => event.reply(IPCChannel.RENDERER_UPDATE_COMPONENT, results[1])
  );
});

ipcMain.on(IPCChannel.LIBRARY_REMOVE_COMPONENT, (event, componentId) => {
  Promise.all([
    library.removeComponent(componentId),
    library.getComponents(),
  ]).then((results) =>
    event.reply(IPCChannel.RENDERER_UPDATE_COMPONENT, results[1])
  );
});

ipcMain.on(
  IPCChannel.LIBRARY_IMPORT_TO_MODEL,
  (event, filepath, xpath, componentId) => {
    const file = editorSystem.getFile(filepath);
    file
      .importComponent(xpath, componentId)
      .then(() =>
        event.reply(
          IPCChannel.RENDERER_UPDATE_FILE_CONTENT,
          filepath,
          file.getContent()
        )
      );
  }
);
