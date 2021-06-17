import { IEditorSystem, IFile } from "Types";
import File from "./File";

export default class EditorSystem implements IEditorSystem {
  private openedFiles: Map<string, IFile> = new Map();

  public openFile(filepath: string): boolean {
    if (!this.openedFiles.has(filepath)) {
      this.openedFiles.set(filepath, new File(filepath));
      console.log(`Opened: ${filepath}`);
      return true;
    } else {
      return false;
    }
  }

  public openFiles(filepaths: string[]): boolean[] {
    const success: boolean[] = [];
    for (const filepath of filepaths) {
      success.push(this.openFile(filepath));
    }
    return success;
  }

  public closeFile(filepath: string): boolean {
    if (this.openedFiles.has(filepath)) {
      this.openedFiles.delete(filepath);
      return true;
    } else {
      return false;
    }
  }

  public getFile(filepath: string): IFile {
    if (this.openedFiles.has(filepath)) {
      return this.openedFiles.get(filepath);
    } else {
      return null;
    }
  }

  public getOpenedFiles(): IFile[] {
    return Array.from(this.openedFiles.values());
  }

  public getOpenedFilepaths(): string[] {
    return Array.from(this.openedFiles.keys());
  }

  public saveFile(filepath: string): void {
    this.openedFiles.get(filepath).saveContent();
  }

  public updateFileContent(filepath: string, content: string): void {
    this.openedFiles.get(filepath).updateContent(content);
  }
}
