import CellMLModel from "./CellMLModel";

export default class EditorSystem {
  private openedFiles: Map<string, CellMLModel> = new Map();

  public openFile(file: string): boolean {
    if (!this.openedFiles.has(file)) {
      this.openedFiles.set(file, new CellMLModel(file));
      console.log(`Opened: ${file}`);
      console.log(`Filename: ${this.openedFiles.get(file).filename}`);
      return true;
    } else {
      return false;
    }
  }

  public openFiles(files: string[]): boolean[] {
    const success: boolean[] = [];
    for (const file of files) {
      success.push(this.openFile(file));
    }
    return success;
  }

  public closeFile(file: string): boolean {
    if (this.openedFiles.has(file)) {
      this.openedFiles.delete(file);
      return true;
    } else {
      return false;
    }
  }

  public getFile(file: string): CellMLModel {
    if (this.openedFiles.has(file)) {
      return this.openedFiles.get(file);
    } else {
      return null;
    }
  }

  public getOpenedFile(): string[] {
    return Array.from(this.openedFiles.keys());
  }
}
