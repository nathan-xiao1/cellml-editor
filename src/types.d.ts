export class File {
  getFilepath(): string;
  getFilename(): string;
  getContent(): string;
  updateContent(): string;
}

export default class EditorSystem {
  openFile(filepath: string): boolean;
  openFiles(filepaths: string[]): boolean[];
  closeFile(filepath: string): boolean;
  getFile(filepath: string): File;
  getOpenedFiles(): File[];
  getOpenedFilepaths(): string[];
}
