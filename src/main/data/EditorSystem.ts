import { IEditorSystem, IFile, IFileState } from "Types";
import CellMLParser from "../parser/Parser";
import CellMLFile from "./CellMLFile";
import GraphicalFile from "./GraphicalFile";
import PdfFile from "./PdfFile";
import { templates } from "./Templates";

export default class EditorSystem implements IEditorSystem {
  private unsavedFileIDAcc = 0;
  private openedFiles: Map<string, IFile> = new Map();
  private cellmlParser: CellMLParser;

  public async init(): Promise<void> {
    this.cellmlParser = new CellMLParser();
    return this.cellmlParser.init();
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
    Create a new file
  */
  public newFile(content?: string): IFile {
    const filename = `Untitled-${this.unsavedFileIDAcc++}`;
    const file = new CellMLFile(filename, this.cellmlParser, true);
    this.openedFiles.set(filename, file);
    if (content) file.updateContent(content);
    return file;
  }

  public newFileReadonly(id: string, filename: string, content: string): IFile {
    const filepath = `${id}\\${filename}`;
    const file = new CellMLFile(filepath, this.cellmlParser, true, true);
    this.openedFiles.set(filepath, file);
    if (content) file.updateContent(content);
    return file;
  }

  public newFileFromTemplate(template: string): IFile {
    if (!templates.has(template)) {
      console.log("Missing Template");
      return undefined;
    }
    const file = this.newFile();
    file.updateContent(templates.get(template));
    return file;
  }

  public openFile(filepath: string): IFile {
    if (!this.openedFiles.has(filepath)) {
      // File not opened yet
      const file = new CellMLFile(filepath, this.cellmlParser);
      this.openedFiles.set(filepath, file);
      console.log(`Opened: ${filepath}`);
      return file;
    } else {
      // File already opened
      return null;
    }
  }

  public openFilePdf(id: string): IFile {
    if (!this.openedFiles.has(id)) {
      const file = new PdfFile(id);
      this.openedFiles.set(id, file);
      return file;
    }
    return null;
  }

  public newFileGraphical(): IFile {
    const id = "Graphical Editor";
    if (!this.openedFiles.has(id)) {
      const file = new GraphicalFile(id);
      this.openedFiles.set(id, file);
      return file;
    }
    return null;
  }

  public openFiles(filepaths: string[]): IFile[] {
    const files: IFile[] = [];
    for (const filepath of filepaths) {
      const file = this.openFile(filepath);
      if (file) files.push(file);
    }
    return files;
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

  public getOpenedFilesState(): IFileState[] {
    const states: IFileState[] = [];
    this.openedFiles.forEach((file) => {
      states.push(file.getState());
    });
    return states;
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
    file.saveContent();
  }

  public updateFileContent(filepath: string, content: string): void {
    this.openedFiles.get(filepath).updateContent(content);
  }

  public fileIsSaved(filepath: string): boolean {
    return this.openedFiles.get(filepath)?.getSaved();
  }

  public fileIsNew(filepath: string): boolean {
    return this.openedFiles.get(filepath)?.fileIsNew();
  }
}
