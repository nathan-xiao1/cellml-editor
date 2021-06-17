import File from "./File";

export default class EditorSystem {
  private openedFiles: Map<string, File> = new Map();

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

  public getFile(filepath: string): File {
    if (this.openedFiles.has(filepath)) {
      return this.openedFiles.get(filepath);
    } else {
      return null;
    }
  }

  public getOpenedFiles(): File[] {
    return Array.from(this.openedFiles.values());
  }

  public getOpenedFilepaths(): string[] {
    return Array.from(this.openedFiles.keys());
  }
}
