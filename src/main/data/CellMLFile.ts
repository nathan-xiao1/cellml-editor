import fs from "fs";
import IPCChannel from "IPCChannels";
import { webContents } from "electron";
import { IProblemItem, IFile, IFileState, FileType, IParsedDOM } from "Types";
import CellMLParser from "../parser/Parser";
import { library } from "../index";

export default class CellMLFile implements IFile {
  private _parser: CellMLParser;
  private _filepath: string;
  private _parsedDOM: IParsedDOM;
  private _content: string;
  private _problems: IProblemItem[];
  private _saved: boolean;
  private _fileIsNew: boolean;
  private _readonly: boolean;

  constructor(
    filepath: string,
    parser: CellMLParser,
    isNewFile = false,
    readonly = false
  ) {
    this._parser = parser;
    this._filepath = filepath;
    this._content = isNewFile ? "" : fs.readFileSync(this._filepath, "utf8");
    this._problems = [];
    this._saved = !isNewFile;
    this._fileIsNew = isNewFile;
    this._readonly = readonly;
    this._parse(this._content);
  }

  public getFilepath(): string {
    return this._filepath;
  }

  public setFilepath(filepath: string): void {
    this._filepath = filepath;
  }

  public getFilename(): string {
    return this._filepath.split("\\").pop().split("/").pop();
  }

  public getContent(): string {
    return this._content;
  }

  public getSaved(): boolean {
    return this._saved;
  }

  public fileIsNew(): boolean {
    return this._fileIsNew;
  }

  /*
    Update the content (in memory) of the file. Called when the content 
    of the file's Monaco model is changed
  */
  public updateContent(content: string, notify = true): void {
    this._content = content;
    this._parse(this._content);
    this._saved = false;
    if (notify) this.notifyWebContents();
  }

  public updateAttribute(xpath: string, key: string, value: string): void {
    this._parsedDOM.updateAttribute(xpath, key, value);
    this.updateContent(this._parsedDOM.toString());
  }

  public addChildNode(xpath: string, childName: string): void {
    this._parsedDOM.addChildNode(xpath, childName);
    this.updateContent(this._parsedDOM.toString());
  }

  public removeChildNode(xpath: string): void {
    this._parsedDOM.removeChildNode(xpath);
    this.updateContent(this._parsedDOM.toString());
  }

  public async importComponent(
    xpath: string,
    componentId: string
  ): Promise<void> {
    const component = await library.getComponent(componentId);
    this._parsedDOM.importComponent(xpath, component);
    this.updateContent(this._parsedDOM.toString());
  }

  public async exportComponent(xpath: string, name: string): Promise<boolean> {
    const component = this._parsedDOM.exportComponent(xpath);
    return library.addComponent({
      name: name,
      rootTag: component.name,
      content: component.content,
    });
  }

  /*
    Write the content (in memory) of the file to disk
  */
  public saveContent(): void {
    fs.writeFile(this._filepath, this._content, (error) => {
      if (error != null) console.log(error);
    });
    this._saved = true;
    this._fileIsNew = false;
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
  }

  /*
    Return a state summary of this file
  */
  public getState(): IFileState {
    return {
      dom: this._parsedDOM.IDOM,
      readonly: this._readonly,
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
    Parse the text and update the problem list
  */
  private _parse(content: string): void {
    const result = this._parser.parse(content);
    this._parsedDOM = result;
    this.updateProblems(result.problems);
  }

  getType(): FileType {
    return "CellML";
  }
}
