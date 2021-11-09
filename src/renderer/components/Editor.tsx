import React, { createRef } from "react";
import IPCChannel from "IPCChannels";
import { ipcRenderer } from "electron";
import { loader, Monaco } from "@monaco-editor/react";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import { getNodeFromXPath } from "src/commons/utils/xpath";
import "react-reflex/styles.css";
import "./Editor.scss";

import Header from "./Header/Header";
import Pane from "./Panes/Pane";
import ProblemPane from "./Panes/ProblemPane/ProblemPane";
import TextEditor from "./TextEditor/TextEditor";
import TitleMenuBar from "./TitleMenuBar/TitleMenuBar";
import PdfViewer from "./PdfViewer/PdfViewer2";
import { IDOM, IFileState, ViewMode } from "Types";
import TreePane from "./Panes/TreePane/TreePane";
import ElementPane from "./Panes/ElementPane/ElementPane";
import AttributePane from "./Panes/AttributePane/AttributePane";
import EquationViewer from "./EquationViewer/EquationViewer";
import ImportPane from "./Panes/ImportPane/ImportPane";
import Prompt from "./Prompt/Prompt";
import monaco, { editor } from "monaco-editor";
import indentString from "indent-string";
import Mousetrap from "mousetrap";

import VisualPane from "./Panes/VisualPane";
import CreateImgModel from "./CreateImgModel";

let graphics_or_text = 0;

const emptyState: IFileState = {
  dom: undefined,
  saved: true,
  readonly: false,
  fileType: undefined,
  filepath: undefined,
  problems: [],
};

interface EditorState {
  currentMode: ViewMode;
  openedFiles: IFileState[];
  activeFileIndex: number;
  activeFileCursorXPath: string;
  activeFileCursorIDOM: IDOM;
  activeMathString?: string;
  mathStartIndex: number;
  mathEndIndex: number;
  promptShow: boolean;
  promptState: PromptState;
  mathTagIncluded: boolean;
}

interface PromptState {
  title: string;
  label: string;
  onSubmit: () => void;
}

export default class Editor extends React.Component<unknown, EditorState> {
  private initialisedFiles: Set<string>;
  private textEditorRef = createRef<TextEditor>();
  private visualPaneRef = createRef<VisualPane>();
  private monaco: Monaco;

  constructor(props: unknown) {
    super(props);
    this.initialisedFiles = new Set();
    this.state = {
      currentMode: "text",
      openedFiles: [],
      activeFileIndex: -1,
      activeFileCursorXPath: undefined,
      activeFileCursorIDOM: undefined,
      activeMathString: "",
      mathStartIndex: undefined,
      mathEndIndex: undefined,
      promptShow: false,
      promptState: undefined,
      mathTagIncluded: undefined,
    };

    // Set listener to update openedFile state
    ipcRenderer.on(IPCChannel.RENDERER_UPDATE_OPENED_FILE, (_, arg) => {
      this.setState(
        (prevState) => {
          let newActiveFileIndex: number;
          if (
            arg.length > 0 &&
            arg.length <= prevState.openedFiles.length &&
            prevState.activeFileIndex >= 0 &&
            prevState.activeFileIndex <= arg.length - 1
          ) {
            newActiveFileIndex = prevState.activeFileIndex;
          } else {
            newActiveFileIndex = arg.length - 1;
          }
          return {
            openedFiles: arg,
            activeFileIndex: newActiveFileIndex,
          };
        },
        () => {
          if (arg.activeFileIndex) {
            this.setActiveFile(arg.activeFileIndex);
          } else {
            this.setActiveFile(this.state.activeFileIndex);
          }
        }
      );
    });

    // Set listener to update this.state using file state from ipcMain
    ipcRenderer.on(
      IPCChannel.RENDERER_UPDATE_FILE_STATE,
      (_, newFileState: IFileState) => {
        const fileIdx = this.state.openedFiles.findIndex(
          (f) => f.filepath == newFileState.filepath
        );
        this.setState((oldState) => {
          const newOpenedFile = [...oldState.openedFiles];
          newOpenedFile[fileIdx] = newFileState;
          return {
            openedFiles: newOpenedFile,
          };
        });
      }
    );

    // Set listener to update/replace the content in the active editor
    ipcRenderer.on(
      IPCChannel.RENDERER_UPDATE_FILE_CONTENT,
      (_, filepath, content) => {
        if (filepath == this.getActiveFilepath()) {
          this.textEditorRef?.current.setValue(content);
        }
      }
    );

    // Set listener to set the active file
    ipcRenderer.on(IPCChannel.RENDERER_SET_ACTIVE_FILE, (_, filepath) => {
      if (this.state.openedFiles.find((file) => file.filepath == filepath))
        this.setActiveFile(filepath);
    });

    // Get monaco instance
    loader.init().then(
      function (monacoInstance: Monaco) {
        this.monaco = monacoInstance;
      }.bind(this)
    );
  }

  getActiveFilepath(): string {
    return this.state.openedFiles[this.state.activeFileIndex]?.filepath;
  }

  getActiveFile(): IFileState {
    if (this.state.activeFileIndex == -1) return emptyState;
    return this.state.openedFiles[this.state.activeFileIndex];
  }

  /*
   Set a file as the active file and update this.state using the response from ipcMain
  */
  setActiveFile(filepath: string | number): void {
    const openedFilepaths = this.state.openedFiles.map(
      (fileState) => fileState.filepath
    );
    const index =
      typeof filepath == "string"
        ? openedFilepaths.indexOf(filepath)
        : filepath;
    this.setState(
      {
        activeFileIndex: index,
        activeFileCursorIDOM: undefined,
        activeFileCursorXPath: undefined,
      },
      () => {
        if (index == -1) this.toggleEditorView("text");
        if (this.state.currentMode == "graphical") {
          this.visualPaneRef?.current?.testXMLconvert(this.getActiveFilepath());
        }
      }
    );
  }

  /*
   Close a file by notifying ipcMain and deleting Monaco's model of the fle
  */
  closeFile(filepath: string): void {
    ipcRenderer.invoke(IPCChannel.CLOSE_FILE, filepath).then((confirmed) => {
      if (!confirmed) return;
      this.initialisedFiles.delete(filepath);
      this.monaco?.editor.getModel(this.monaco.Uri.parse(filepath))?.dispose();
    });
  }

  /*
   Get file content to initialise Monaco's defaultValue only if the file hasn't 
   been initialied before
  */
  getDefaultContent(filepath: string): string {
    if (this.initialisedFiles.has(filepath)) {
      console.debug(`${filepath} already initialised`);
      return null;
    }
    console.debug(`${filepath} not initialised`);
    this.initialisedFiles.add(filepath);
    return ipcRenderer.sendSync(
      IPCChannel.GET_FILE_CONTENT,
      this.getActiveFilepath()
    );
  }

  /*
   Callback for Monaco to send the changed file content back to ipcMain
  */
  monacoOnChangeCallback(content: string): void {
    ipcRenderer.send(
      IPCChannel.UPDATE_FILE_CONTENT,
      this.getActiveFilepath(),
      content
    );
  }

  /*
   Used as the 'constructor' for this Editor.tsx as Monaco doesn't 
   load properly sometime before being mounted
  */
  monacoOnMountCallback(): void {
    ipcRenderer
      .invoke(IPCChannel.GET_OPENED_FILEPATHS_ASYNC)
      .then((initialOpenedFile: IFileState[]) => {
        this.setState(
          {
            openedFiles: initialOpenedFile,
          },
          () => this.setActiveFile(initialOpenedFile.length - 1)
        );
      });
  }

  /*
    Callback to get the IDOM at the editor's cursor position
  */
  monacoCursorPositionChangedCallback(path: string): void {
    this.setState((prevState) => ({
      activeFileCursorXPath: path,
      activeFileCursorIDOM: getNodeFromXPath(
        prevState.openedFiles[prevState.activeFileIndex].dom,
        path
      ),
    }));
  }

  monacoCursorPositionChangedMath(
    mathstr: string,
    startIndex: number,
    endIndex: number,
    mathTagIncluded: boolean
  ): void {
    // const cleanedAttributes = mathstr.replace(/cellml:[^</>)]*/mg, '');

    if (mathstr != this.state.activeMathString) {
      this.setState(() => ({
        activeMathString: mathstr,
        mathStartIndex: startIndex,
        mathEndIndex: endIndex,
        mathTagIncluded: mathTagIncluded,
      }));
    }
  }

  /*
    Toggle between the Monaco text editor and the graphical editor view
  */
  toggleEditorView(mode: ViewMode): void {
    this.setState(
      () => ({
        currentMode: mode,
      }),
      () => {
        const activeFilepath = this.getActiveFilepath();
        if (activeFilepath)
          ipcRenderer.send(IPCChannel.SAVE_FILE, this.getActiveFilepath());
        this.visualPaneRef?.current?.testXMLconvert(this.getActiveFilepath());
      }
    );
  }

  handleReplaceRange(
    string: string,
    startOffset: number,
    endOffset: number
  ): void {
    try {
      const model = this.monaco?.editor.getModel(
        this.monaco.Uri.parse(this.getActiveFilepath())
      );
      const start = model.getPositionAt(startOffset);
      const end = model.getPositionAt(endOffset);
      // const selection = new monaco.Selection(start.lineNumber, start.column, end.lineNumber, end.column);

      // Calculating and adding offset
      const line = model.getLineContent(start.lineNumber);
      const count = line.search(/\S/);
      const text = indentString(string, count).trim();
      // if (text.charAt(-1) !== '\n') text += '\n';

      // Creating edit operation
      const editOp: monaco.editor.IIdentifiedSingleEditOperation = {
        range: {
          startColumn: start.column,
          startLineNumber: start.lineNumber,
          endColumn: end.column,
          endLineNumber: end.lineNumber,
        },
        text: text,
        forceMoveMarkers: true,
      };

      model.pushEditOperations([], [editOp], () => []);
      // let text = model.getValue();
      // text = text.substring(0, startOffset) + string + text.substring(endOffset);
      // model.setValue(text);
    } catch (e) {
      console.log("Replace failed: ", e);
    }
  }

  addChildNodeHandler(child: string): void {
    ipcRenderer.send(
      IPCChannel.ADD_CHILD_NODE,
      this.getActiveFilepath(),
      this.state.activeFileCursorXPath,
      child
    );
    console.log(`Adding child: ${child}`);
  }

  removeChildNodeHandler(idx: number): void {
    const dom = this.state.activeFileCursorIDOM;
    let nth = 1;
    for (let i = 0; i < idx; i++) {
      if (dom.children[i].name == dom.children[idx].name) {
        nth++;
      }
    }
    const xpath =
      this.state.activeFileCursorXPath + `/${dom.children[idx].name}[${nth}]`;
    ipcRenderer.send(
      IPCChannel.REMOVE_CHILD_NODE,
      this.getActiveFilepath(),
      xpath
    );
    console.log(`Removing child: ${xpath}`);
  }

  attributeEditHandler(key: string, value: string): void {
    ipcRenderer.send(
      IPCChannel.UPDATE_ATTRIBUTE,
      this.getActiveFilepath(),
      this.state.activeFileCursorXPath,
      key,
      value
    );
    console.log(`Editing: ${key} -> ${value}`);
  }

  domTreeClickHandler(lineNum: number): void {
    this.textEditorRef.current?.goToLine(lineNum);
  }

  exportComponent(): void {
    this.openPrompt(
      "Export Component",
      "Export Component Name:",
      (name: string) => {
        ipcRenderer.send(
          IPCChannel.LIBRARY_ADD_COMPONENT,
          this.getActiveFilepath(),
          this.state.activeFileCursorXPath,
          name
        );
        this.closePrompt();
      }
    );
  }

  openLibraryComponent(componentId: string): void {
    ipcRenderer.send(IPCChannel.LIBRARY_OPEN_COMPONENT, componentId);
  }

  openFileFromUrl(url: string): void {
    ipcRenderer.send(IPCChannel.OPEN_FROM_URL, url);
    this.closePrompt();
  }

  openPrompt(
    title: string,
    label: string,
    onSubmit: (...args: unknown[]) => void
  ): void {
    this.setState({
      promptShow: true,
      promptState: {
        title: title,
        label: label,
        onSubmit: onSubmit,
      },
    });
  }

  closePrompt(): void {
    this.setState({ promptShow: false });
  }

  componentDidMount(): void {
    Mousetrap.bind("mod+w", () => this.closeFile(this.getActiveFilepath()));
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_OPENED_FILE);
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_FILE_STATE);
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_FILE_CONTENT);
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_SET_ACTIVE_FILE);
    Mousetrap.unbind("mod+w");
  }

  undo(): void {
    this.textEditorRef?.current?.undo();
  }

  redo(): void {
    this.textEditorRef?.current?.redo();
  }

  formatDocument(): void {
    this.textEditorRef?.current?.formatDocument();
  }

  changemodel(): void {
    console.log("change model");
    console.log(graphics_or_text);
    // change mode to allow the user to generate their own model
    graphics_or_text === 0 ? (graphics_or_text = 1) : (graphics_or_text = 0);
    console.log(graphics_or_text);

    // if changed to text --> deafult text view
    if (graphics_or_text === 0) {
      document.getElementById("user_model_creator").style.display = "none";
      document.getElementById("create_new_model_img").textContent =
        "CREATE MODEL";

      const pmh = document.getElementsByClassName(
        "pane-middle-header"
      ) as HTMLCollectionOf<HTMLElement>;
      pmh[0].style.display = "block";
      const pmt = document.getElementsByClassName(
        "pane-middle-top"
      ) as HTMLCollectionOf<HTMLElement>;
      pmt[0].style.display = "block";
      const pmb = document.getElementsByClassName(
        "pane-middle-bottom"
      ) as HTMLCollectionOf<HTMLElement>;
      pmb[0].style.display = "block";
    }
    // if in graphics view then display create page panel
    else {
      document.getElementById("user_model_creator").style.display = "block";
      document.getElementById("create_new_model_img").textContent = "TEXT VIEW";

      const pmh = document.getElementsByClassName(
        "pane-middle-header"
      ) as HTMLCollectionOf<HTMLElement>;
      pmh[0].style.display = "none";
      const pmt = document.getElementsByClassName(
        "pane-middle-top"
      ) as HTMLCollectionOf<HTMLElement>;
      pmt[0].style.display = "none";
      const pmb = document.getElementsByClassName(
        "pane-middle-bottom"
      ) as HTMLCollectionOf<HTMLElement>;
      pmb[0].style.display = "none";
    }
  }

  render(): React.ReactNode {
    const activeFilepath: string = this.getActiveFilepath();
    return (
      <React.Fragment>
        <TitleMenuBar
          getActiveFilepath={this.getActiveFilepath.bind(this)}
          formatDocument={this.formatDocument.bind(this)}
          saveBtnEnabled={
            this.getActiveFile().fileType == "CellML" &&
            this.state.currentMode == "text"
          }
          openPrompt={() =>
            this.openPrompt(
              "Open File from URL",
              "URL:",
              this.openFileFromUrl.bind(this)
            )
          }
        />
        {this.state.promptShow && (
          <Prompt
            title={this.state.promptState.title}
            label={this.state.promptState.label}
            onSubmit={this.state.promptState.onSubmit}
            onClose={this.closePrompt.bind(this)}
          ></Prompt>
        )}
        <div className="editor-container primary-bg primary-text">
          <ReflexContainer orientation="vertical" windowResizeAware={true}>
            <ReflexElement className="pane-left" minSize={150} flex={0.15}>
              <ReflexContainer orientation="horizontal">
                <ReflexElement className="pane-left-top" minSize={25}>
                  <Pane title="Element View" collapsible={false}>
                    <ElementPane
                      node={this.state.activeFileCursorIDOM}
                      path={this.state.activeFileCursorXPath}
                      addChildHandler={this.addChildNodeHandler.bind(this)}
                      removeChildHandler={this.removeChildNodeHandler.bind(
                        this
                      )}
                    />
                  </Pane>
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-left-middle"
                  minSize={25}
                  flex={0.3}
                >
                  <Pane title="Import Component" collapsible={false}>
                    <ImportPane
                      readonly={this.getActiveFile().readonly}
                      openLibraryComponent={this.openLibraryComponent.bind(
                        this
                      )}
                      filepath={this.getActiveFilepath()}
                      xpath={this.state.activeFileCursorXPath}
                    />
                  </Pane>
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-left-bottom"
                  minSize={25}
                  flex={0.25}
                >
                  <Pane title="Tree View" collapsible={false}>
                    <TreePane
                      dom={this.getActiveFile().dom}
                      onClickHandler={this.domTreeClickHandler.bind(this)}
                    />
                  </Pane>
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
            <ReflexSplitter className="primary-splitter splitter" />
            <ReflexElement className="pane-middle">
              <ReflexContainer orientation="horizontal">
                <ReflexElement className="pane-middle-header" size={35}>
                  <Header
                    openedFiles={this.state.openedFiles}
                    activeFileIndex={this.state.activeFileIndex}
                    showToggle={
                      this.state.openedFiles.length > 0 &&
                      this.getActiveFile().fileType == "CellML"
                    }
                    onTabClick={this.setActiveFile.bind(this)}
                    onTabClose={this.closeFile.bind(this)}
                    toggleViewMode={this.toggleEditorView.bind(this)}
                  />
                </ReflexElement>

                <ReflexElement
                  className={`pane-middle-top primary-bg-dark ${
                    this.state.currentMode == "text" ||
                    this.getActiveFile().fileType == "cellml"
                      ? "no-overflow"
                      : ""
                  }`}
                >
                  <TextEditor
                    ref={this.textEditorRef}
                    hidden={
                      this.state.openedFiles.length == 0 ||
                      this.getActiveFile().fileType != "CellML" ||
                      this.state.currentMode != "text"
                    }
                    readonly={this.getActiveFile().readonly}
                    filepath={activeFilepath}
                    defaultValue={this.getDefaultContent(activeFilepath)}
                    problems={this.getActiveFile().problems}
                    exportComponentHandler={this.exportComponent.bind(this)}
                    onMountCallback={this.monacoOnMountCallback.bind(this)}
                    onChangeCallback={this.monacoOnChangeCallback.bind(this)}
                    onCursorPositionChangedCallback={this.monacoCursorPositionChangedCallback.bind(
                      this
                    )}
                    onCursorPositionChangedMath={this.monacoCursorPositionChangedMath.bind(
                      this
                    )}
                  />
                  <PdfViewer
                    hidden={
                      this.state.openedFiles.length == 0 ||
                      this.getActiveFile().fileType != "PDF"
                    }
                    file={this.getActiveFile()}
                  ></PdfViewer>
                  <CreateImgModel
                    hidden={this.getActiveFile()?.fileType != "Graphical"}
                  ></CreateImgModel>
                  <VisualPane
                    ref={this.visualPaneRef}
                    dom={this.getActiveFile().dom}
                    filepath={activeFilepath}
                    hidden={this.state.currentMode == "graphical"}
                    onClickHandler={this.domTreeClickHandler.bind(this)}
                  />
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-middle-bottom"
                  minSize={25}
                  flex={0.25}
                >
                  <Pane title="Problem">
                    <ProblemPane problems={this.getActiveFile().problems} />
                  </Pane>
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
            <ReflexSplitter className="primary-splitter splitter" />

            <ReflexElement className="pane-right" minSize={150} flex={0.15}>
              <ReflexContainer orientation="horizontal">
                <ReflexElement className="pane-right-top" minSize={25}>
                  <Pane title="Math View" collapsible={false}>
                    {this.state.activeMathString &&
                    this.state.activeMathString !== "" ? (
                      <EquationViewer
                        // dom={this.state.activeFileDOM}
                        str={this.state.activeMathString}
                        // node={this.state.activeFileCursorIDOM}
                        xpath={this.state.activeFileCursorXPath}
                        start={this.state.mathStartIndex}
                        end={this.state.mathEndIndex}
                        replaceHandler={this.handleReplaceRange.bind(this)}
                        mathTagIncluded={this.state.mathTagIncluded}
                      />
                    ) : null}
                  </Pane>
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-right-bottom"
                  minSize={25}
                  flex={0.4}
                >
                  <AttributePane
                    node={this.state.activeFileCursorIDOM}
                    attributeEditHandler={this.attributeEditHandler.bind(this)}
                  />
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
          </ReflexContainer>
        </div>
      </React.Fragment>
    );
  }
}
