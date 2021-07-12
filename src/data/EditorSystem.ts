import { IEditorSystem, IFile } from "Types";
import CellMLParser from "../parser/parser";
import CellMLFile from "./CellMLFile";
import PdfFile from "./PdfFile";
import { templates } from "./Templates";

export const CellMLSpecification = "CellML 2.0 Specification";

export default class EditorSystem implements IEditorSystem {
  private unsavedFileIDAcc = 0;
  private openedFiles: Map<string, IFile> = new Map();
  private cellmlParser: CellMLParser;

  public async init(): Promise<void> {
    this.cellmlParser = new CellMLParser();
    return await this.cellmlParser.init();
  }

  /*
    Rename a file and keep original order by creating a new Map()
  */
  private _renameFile(oldFilepath: string, newFilepath: string): void {
    const newOpenedFile: Map<string, IFile> = new Map();
    this.openedFiles.forEach((value, key) => {
      if (key == oldFilepath) {
        value.setFilepath(newFilepath);
        newOpenedFile.set(newFilepath, value);
      } else {
        newOpenedFile.set(key, value);
      }
    });
    this.openedFiles = newOpenedFile;
  }

  /*
    Create a new file that is marked as unsaved
  */
  public newFile(): boolean {
    const filename = `New-File-${this.unsavedFileIDAcc++}`;
    this.openedFiles.set(
      filename,
      new CellMLFile(filename, this.cellmlParser, false)
    );
    return true;
  }

  public newFileFromTemplate(template: string): boolean {
    if (!templates.has(template)) {
      console.log("Missing Template");
      return false;
    }
    const filename = `New-File-${this.unsavedFileIDAcc++}`;
    const file = new CellMLFile(filename, this.cellmlParser, false);
    this.openedFiles.set(filename, file);
    file.updateContent(templates.get(template));
    return true;
  }

  public openFile(filepath: string): boolean {
    if (!this.openedFiles.has(filepath)) {
      const file =
        filepath == CellMLSpecification
          ? new PdfFile(filepath)
          : new CellMLFile(filepath, this.cellmlParser);
      this.openedFiles.set(filepath, file);
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

  /*
    Save a file. If 'newFilepath' is provided, the file will be saved
    as 'newFilepath'
  */
  public saveFile(filepath: string, newFilepath?: string): void {
    const file = this.openedFiles.get(filepath);
    if (newFilepath != undefined) {
      this._renameFile(filepath, newFilepath);
    }
    file.setSaved(true);
    file.saveContent();
  }

  public updateFileContent(filepath: string, content: string): void {
    this.openedFiles.get(filepath).updateContent(content);
  }

  public fileIsSaved(filepath: string): boolean {
    return this.openedFiles?.get(filepath).getSaved();
  }
}
