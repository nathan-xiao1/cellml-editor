import { TagContextType } from "./renderer/components/TextEditor/definitions/ContextProvider";
export * from "./ILibcellml";

export interface IFile {
  getFilepath(): string;
  setFilepath(filepath: string): void;
  getFilename(): string;
  getContent(): string;
  getSaved(): boolean;
  fileIsNew(): boolean;
  updateContent(content: string, notify?: boolean): void;
  updateAttribute(xpath: string, key: string, value: string): void;
  addChildNode(xpath: string, childName: string): void;
  removeChildNode(xpath: string): void;
  importComponent(xpath, componentId: string): Promise<void>;
  exportComponent(xpath: string, name: string): Promise<boolean>;
  saveContent(): void;
  getProblems(): IProblemItem[];
  updateProblems(problems: IProblemItem[]): void;
  getState(): IFileState;
  notifyWebContents(): void;
  getType(): FileType;
}

export type FileType = "CellML" | "PDF";

export type ViewMode = "text" | "graphical";

export interface IEditorSystem {
  init(): void;
  newFile(): IFile;
  newFileFromTemplate(template: string): IFile;
  openFile(filepath: string): IFile;
  openFiles(filepaths: string[]): IFile[];
  closeFile(filepath: string): boolean;
  getFile(filepath: string): IFile;
  getOpenedFiles(): IFile[];
  getOpenedFilepaths(): string[];
  saveFile(filepath: string): void;
  updateFileContent(filepath: string, content: string): void;
  fileIsSaved(filepath: string): boolean;
  fileIsNew(filepath: string): boolean;
}

export interface ILibrary {
  getComponents(): Promise<IComponent[]>;
  getComponent(componentId: string): Promise<IComponent>;
  addComponent(component: IComponent): Promise<boolean>;
  removeComponent(componentId: string): Promise<boolean>;
}

export interface IComponent {
  _id?: string;
  name: string;
  rootTag: string;
  content: string;
}

export type ProblemSeverity = "warning" | "error" | "info" | "hint";

export interface IProblemItem {
  title?: string;
  description: string;
  severity: ProblemSeverity;
  startColumn: number;
  endColumn: number;
  startLineNumber: number;
  endLineNumber: number;
}

export interface IFileState {
  dom: IDOM;
  fileType: string;
  filepath: string;
  problems: IProblemItem[];
}

export interface IContextProvider {
  readonly isCompletionAvailable: boolean;
  readonly clearedText: string;
  readonly lastOpenedTag: string;
  readonly isAttributeSearch: boolean;
  readonly tagContext: TagContextType;
  readonly tagContextPrev: TagContextType;
  readonly lastTag: string;
  update(content: string): void;
}

export interface IDOM {
  id: number;
  name: string;
  altName?: string;
  lineNumber: number;
  attributes: IDOMAttributes[];
  children: IDOM[];
}

export interface IDOMAttributes {
  key: string;
  value: string;
}

export interface IParsedDOM {
  readonly problems: IProblemItem[];
  readonly IDOM: IDOM;
  updateAttribute(xpath: string, key: string, value: string): void;
  addChildNode(xpath: string, childName: string): void;
  removeChildNode(xpath: string): void;
  importComponent(xpath: string, component: IComponent): void;
  exportComponent(xpath: string): IComponent;
  toString(): string;
}

export interface IParser {
  init();
  parse(content: string): ParserResult;
}
