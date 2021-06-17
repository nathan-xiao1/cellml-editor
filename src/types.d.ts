export interface IFile {
  getFilepath(): string;
  getFilename(): string;
  getContent(): string;
  updateContent(content: string): void;
  saveContent(): void;
}

export interface IEditorSystem {
  openFile(filepath: string): boolean;
  openFiles(filepaths: string[]): boolean[];
  closeFile(filepath: string): boolean;
  getFile(filepath: string): IFile;
  getOpenedFiles(): IFile[];
  getOpenedFilepaths(): string[];
  saveFile(filepath: string): void;
  updateFileContent(filepath: string, content: string): void;
}
