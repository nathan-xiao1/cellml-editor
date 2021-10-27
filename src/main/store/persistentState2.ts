import fs from "fs";
import { app } from "electron";
import Store from "electron-store";

import EditorSystem from "src/main/data/EditorSystem";
import {
  IPersistenceStateSchema,
  IPersistentFile,
} from "./schema/persistenceStateSchema";
import path from "path";

const USER_DATA_PATH = app.getPath("userData");
const PERSISTENCE_DIRECTORY = path.join(USER_DATA_PATH, "Persistence");
if (!fs.existsSync(PERSISTENCE_DIRECTORY)) {
  fs.mkdirSync(PERSISTENCE_DIRECTORY);
}

export function loadState(
  store: Store<IPersistenceStateSchema>,
  editorSystem: EditorSystem
): void {
  const files = store.get("files");
  files.forEach((pFile) => {
    const origFileExists = fs.existsSync(pFile.originalFilepath);
    const persisFileExists = fs.existsSync(pFile.persistentFilepath);
    if (!origFileExists || pFile.isNew) {
      const eFile = editorSystem.newFile();
      if (!persisFileExists) return;
      const content = fs.readFileSync(pFile.persistentFilepath, "utf8");
      eFile.updateContent(content, false);
    } else {
      const eFile = editorSystem.openFile(pFile.originalFilepath);
      if (!pFile.isSaved) {
        if (!persisFileExists) return;
        const content = fs.readFileSync(pFile.persistentFilepath, "utf8");
        eFile.updateContent(content, false);
      }
    }
    if (persisFileExists) fs.rmSync(pFile.persistentFilepath);
  });
}

export function saveState(
  store: Store<IPersistenceStateSchema>,
  editorSystem: EditorSystem
): void {
  const persistentFiles: IPersistentFile[] = [];
  editorSystem.getOpenedFiles().forEach((file) => {
    const isSaved = file.getSaved();
    const persistentFilepath = path.join(
      PERSISTENCE_DIRECTORY,
      file.getFilename()
    );
    persistentFiles.push({
      originalFilepath: file.getFilepath(),
      persistentFilepath: isSaved ? null : persistentFilepath,
      isNew: file.fileIsNew(),
      isSaved: isSaved,
    });
    if (!isSaved) {
      fs.writeFileSync(persistentFilepath, file.getContent(), {
        encoding: "utf-8",
      });
    }
  });
  store.set("files", persistentFiles);
}
