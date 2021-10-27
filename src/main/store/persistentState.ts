import Nedb from "nedb";
import EditorSystem from "src/main/data/EditorSystem";
import { IFile } from "Types";

const enum ID {
  OPENED_FILES = "OPENED_FILES",
}

interface FileState {
  filepath: string;
  isNewFile: boolean;
  saved: boolean;
  content: string;
}

/*
	Load the last state from database
*/
export function loadState(db: Nedb, editorSystem: EditorSystem): void {
  db.findOne({ id: ID.OPENED_FILES }, (err, doc) => {
    if (!err && doc) {
      console.log("Previous state found");
      // console.log("Documents: ", doc.files);
      doc.files.forEach((fileState: FileState) => {
        if (fileState.isNewFile) {
          const file = editorSystem.newFile();
          file.updateContent(fileState.content);
        } else {
          const file: IFile = editorSystem.openFile(fileState.filepath);
          if (!fileState.saved) file.updateContent(fileState.content);
        }
      });
    } else {
      console.log("No document in DB");
    }
  });
  db.remove({}, { multi: true });
  db.persistence.compactDatafile();
}

/*
	Save the current state (files opened) to database
*/
export function saveState(db: Nedb, editorSystem: EditorSystem): void {
  const openedFiles: FileState[] = [];
  editorSystem.getOpenedFiles().forEach((file: IFile) => {
    console.log("Checking: ", file.getFilepath(), " => ", file.getSaved());
    openedFiles.push({
      filepath: file.getFilepath(),
      isNewFile: file.fileIsNew(),
      saved: file.getSaved(),
      content: file.getSaved() ? null : file.getContent(),
    });
  });
  db.insert({ id: ID.OPENED_FILES, files: openedFiles });
  db.persistence.compactDatafile();
  console.log("Saved: ", openedFiles);
}
