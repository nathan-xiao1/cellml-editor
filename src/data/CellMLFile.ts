import fs from "fs";
import IPCChannel from "IPCChannels";
import { webContents } from "electron";
import {
  IProblemItem,
  IFile,
  IFileState,
  ProblemSeverity,
  FileType,
} from "Types";
import { Level } from "../parser/ILibcellml";
import CellMLParser from "../parser/parser";

export default class CellMLFile implements IFile {
  private _parser: CellMLParser;
  private _filepath: string;
  private _dom: null; // Placeholder for DOM representation of model
  private _content: string;
  private _problems: IProblemItem[];
  private _saved: boolean; // Indicate new unsaved file

  constructor(filepath: string, parser: CellMLParser, saved = true) {
    this._parser = parser;
    this._filepath = filepath;
    this._content = saved ? fs.readFileSync(this._filepath, "utf8") : "";
    this._problems = [];
    this._saved = saved;
    this._parse(this._content);
  }

  public getFilepath(): string {
    return this._filepath;
  }

  public setFilepath(filepath: string): void {
    this._filepath = filepath;
  }

  public getFilename(): string {
    return this._filepath.split("\\").pop();
  }

  public getContent(): string {
    return this._content;
  }

  public getSaved(): boolean {
    return this._saved;
  }

  public setSaved(saved: boolean): void {
    this._saved = saved;
  }

  /*
    Update the content (in memory) of the file. Called when the content 
    of the file's Monaco model is changed
  */
  public updateContent(content: string): void {
    this._content = content;
    this._parse(this._content);
  }

  /*
    Write the content (in memory) of the file to disk
  */
  public saveContent(): void {
    fs.writeFile(this._filepath, this._content, (error) => {
      if (error != null) console.log(error);
    });
  }

  public getProblems(): IProblemItem[] {
    return this._problems;
  }

  /*
    Update the list of IProblemItem associated with this file and
    notify all Electron window of this update.
  */
  public updateProblems(problems: IProblemItem[]): void {
    this._problems = problems;
    this.notifyWebContents();
  }

  /*
    Return a state summary of this file
  */
  public getState(): IFileState {
    return {
      fileType: this.getType(),
      filepath: this._filepath,
      problems: this.getProblems(),
    };
  }

  /*
    Send the current state of this file to every Electron webContent.
  */
  public notifyWebContents(): void {
    webContents.getAllWebContents().forEach((webContent) => {
      webContent.send(IPCChannel.RENDERER_UPDATE_FILE_STATE, this.getState());
    });
  }

  /*
    Parse the text using the libCellML parser and update the problem list
  */
  private _parse(content: string): void {
    const result = this._parser.parse(content);
    const problems: IProblemItem[] = [];
    [result.hints, result.errors, result.warnings].forEach((type) => {
      type.forEach((error) => {
        let level: ProblemSeverity;
        switch (error.level()) {
          case Level.ERROR:
            level = "error";
            break;
          case Level.WARNING:
            level = "warning";
            break;
          case Level.HINT:
            level = "hint";
            break;
        }
        problems.push({
          description: error.description(),
          severity: level,
          startColumn: 0,
          endColumn: 0,
          startLineNumber: 0,
          endLineNumber: 0,
        });
      });
    });

    this.updateProblems(problems);
  }

  getType(): FileType {
    return "CellML";
  }
}
