import fs from "fs";
import { IFile } from "Types";

export default class File implements IFile{
  private _filepath: string;
  private _dom: null; // Placeholder for DOM representation of model
  private _content: string;

  constructor(filepath: string) {
    this._filepath = filepath;
    this._content = fs.readFileSync(this._filepath, "utf8");
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

  public updateContent(content: string): void {
    this._content = content;
  }

  public saveContent(): void {
    fs.writeFile(this._filepath, this._content, (error) => {
      if (error != null) console.log(error);
    });
  }
}
