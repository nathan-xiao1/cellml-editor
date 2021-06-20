export interface IFile {
  getFilepath(): string;
  getFilename(): string;
  getContent(): string;
  updateContent(content: string): void;
  saveContent(): void;
  getProblems(): IProblemItem[];
  updateProblems(problems: IProblemItem[]): void;
  getState(): IFileState;
  notifyWebContents(): void;
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

export type ProblemSeverity = "warning" | "error" | "info" | "hint";

export interface IProblemItem {
  title: string;
  description: string;
  severity: ProblemSeverity;
  startColumn: number;
  endColumn: number;
  startLineNumber: number;
  endLineNumber: number;
}

export interface IFileState {
  filepath: string;
  problems: IProblemItem[];
}
