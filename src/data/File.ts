import fs from "fs";
import IPCChannel from "IPCChannels";
import { webContents } from "electron";
import { IProblemItem, IFile, IFileState, ProblemSeverity } from "Types";

const generateRandomProblem = (filepath?: string): IProblemItem => {
  const severityArray: ProblemSeverity[] = ["warning", "error", "info", "hint"];
  return {
    title: "Test Error",
    description: "Test Error Description for file: " + filepath,
    severity: severityArray[Math.floor(Math.random() * severityArray.length)],
    startColumn: 0,
    endColumn: 5,
    startLineNumber: 0,
    endLineNumber: 0,
  };
};

export default class File implements IFile {
  private _filepath: string;
  private _dom: null; // Placeholder for DOM representation of model
  private _content: string;
  private _problems: IProblemItem[];
  private _saved: boolean; // Indicate new unsaved file

  constructor(filepath: string, saved = true) {
    this._filepath = filepath;
    this._content = saved ? fs.readFileSync(this._filepath, "utf8") : "";
    this._problems = [generateRandomProblem(this._filepath)];
    this._saved = saved;
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
}
