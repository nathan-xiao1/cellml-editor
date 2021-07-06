import { FileType, IFile, IFileState, IProblemItem } from "Types";

export default class PdfFile implements IFile {
  private _filepath: string;

  constructor(filepath: string) {
    this._filepath = filepath;
  }

  getFilepath(): string {
    return this._filepath;
  }
  setFilepath(): void {
    return;
  }
  getFilename(): string {
    return null;
  }
  getContent(): string {
    return null;
  }
  getSaved(): boolean {
    return true;
  }
  setSaved(): void {
    return;
  }
  updateContent(): void {
    return;
  }
  saveContent(): void {
    return;
  }
  getProblems(): IProblemItem[] {
    return [];
  }
  updateProblems(): void {
    return;
  }
  getState(): IFileState {
    return {
      fileType: this.getType(),
      filepath: this._filepath,
      problems: this.getProblems(),
    };
  }
  notifyWebContents(): void {
    return;
  }

  getType(): FileType {
    return "PDF";
  }
}