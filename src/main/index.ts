import { app, BrowserWindow } from "electron";
import Store from "electron-store";

import EditorSystem from "./data/EditorSystem";
import Library from "./data/Library";

import PersistenceStateSchema from "./store/schema/persistenceStateSchema";
import SettingsSchema from "./store/schema/settingsSchema";
import { loadState, saveState } from "./store/persistentState2";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

const persistentStore = new Store({
  name: "Persistence",
  schema: PersistenceStateSchema,
});
export const settingsStore = new Store({
  name: "Settings",
  schema: SettingsSchema,
});

export const library = new Library();
export const editorSystem = new EditorSystem();

// Callbacks on app init
editorSystem.init().then(() => {
  if (settingsStore.get("persistentStateEnabled")) {
    console.log(`Loading persistent state...`);
    loadState(persistentStore, editorSystem);
  }
});

// Callbacks on app exit
app.on("will-quit", async () => {
  console.log("Saving persistent state...");
  saveState(persistentStore, editorSystem);
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 720,
    width: 1280,
    minHeight: 240,
    minWidth: 426,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    frame: !true,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Remove default menu
  mainWindow.setMenu(null);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
import("./handlers/MainHandlers");
import("./handlers/FileHandlers");
import("./handlers/LibraryHandlers");
import("./handlers/SettingsHandlers");
