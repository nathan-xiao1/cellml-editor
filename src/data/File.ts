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

  constructor(filepath: string) {
    this._filepath = filepath;
    this._content = fs.readFileSync(this._filepath, "utf8");
    this._problems = [generateRandomProblem(this._filepath)];
  }

  public getFilepath(): string {
    return this._filepath;
  }

  public getFilename(): string {
    return this._filepath.split("\\").pop();
  }

  public getContent(): string {
    return this._content;
  }

  /*
   Called when the content of the file's Monaco model is changed
  */
  public updateContent(content: string): void {
    this._content = content;
  }

  public saveContent(): void {
    fs.writeFile(this._filepath, this._content, (error) => {
      if (error != null) console.log(error);
    });
  }

  public getProblems(): IProblemItem[] {
    return this._problems;
  }

  public updateProblems(problems: IProblemItem[]): void {
    this._problems = problems;
    this.notifyWebContents();
  }

  public getState(): IFileState {
    return {
      filepath: this._filepath,
      problems: this.getProblems(),
    };
  }

  public notifyWebContents(): void {
    webContents.getAllWebContents().forEach((webContent) => {
      webContent.send(IPCChannel.RENDERER_UPDATE_FILE_STATE, this.getState());
    });
  }
}
