import { ipcMain } from "electron";
import IPCChannel from "IPCChannels";

import { settingsStore } from "../index";

ipcMain.handle(IPCChannel.GET_SETTING, (_, key) => {
  return settingsStore.get(key, null);
});

ipcMain.handle(IPCChannel.SET_SETTING, (_, key, value) => {
  return settingsStore.set(key, value);
});

ipcMain.handle(IPCChannel.TOGGLE_SETTING, (_, key) => {
  const value = settingsStore.get(key, null);
  if (value != null && typeof value == "boolean") {
    settingsStore.set(key, !value);
    return !value;
  }
  return undefined;
});
