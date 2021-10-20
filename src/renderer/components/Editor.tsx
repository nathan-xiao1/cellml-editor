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
import PdfViewer from "./PdfViewer/PdfViewer";
import { FileType, IDOM, IFileState, IProblemItem, ViewMode } from "Types";
import TreePane from "./Panes/TreePane/TreePane";
import ElementPane from "./Panes/ElementPane/ElementPane";
import AttributePane from "./Panes/AttributePane/AttributePane";
import EquationViewer from "./EquationViewer/EquationViewer";
import ImportPane from "./Panes/ImportPane/ImportPane";
import Prompt from "./Prompt/Prompt";

interface EditorState {
  currentMode: ViewMode;
  openedFilepaths: string[];
  activeFileIndex: number;
  activeFileProblems: IProblemItem[];
  activeFileType: FileType;
  activeFileDOM: IDOM;
  activeFileReadonly: boolean;
  activeFileSaved: boolean;
  activeFileCursorXPath: string;
  activeFileCursorIDOM: IDOM;
  activeMathString?: string;
  mathStartIndex: number,
  mathEndIndex: number,
  promptShow: boolean;
  promptState: PromptState;
}

interface PromptState {
  title: string;
  label: string;
  onSubmit: () => void;
}

export default class Editor extends React.Component<unknown, EditorState> {
  private initialisedFiles: Set<string>;
  private textEditorRef = createRef<TextEditor>();
  private monaco: Monaco;

  constructor(props: unknown) {
    super(props);
    this.initialisedFiles = new Set();
    this.state = {
      currentMode: "text",
      openedFilepaths: [],
      activeFileIndex: -1,
      activeFileProblems: [],
      activeFileType: undefined,
      activeFileDOM: undefined,
      activeFileReadonly: false,
      activeFileSaved: false,
      activeFileCursorXPath: undefined,
      activeFileCursorIDOM: undefined,
      activeMathString: "",
      mathStartIndex: undefined,
      mathEndIndex: undefined,
      promptShow: false,
      promptState: undefined,
    };

    // Set listener to update openedFile state
    ipcRenderer.on(IPCChannel.RENDERER_UPDATE_OPENED_FILE, (_, arg) => {
      this.setState(
        (prevState) => {
          let newActiveFileIndex: number;
          if (
            arg.length > 0 &&
            arg.length <= prevState.openedFilepaths.length &&
            prevState.activeFileIndex >= 0 &&
            prevState.activeFileIndex <= arg.length - 1
          ) {
            newActiveFileIndex = prevState.activeFileIndex;
          } else {
            newActiveFileIndex = arg.length - 1;
          }
          return {
            openedFilepaths: arg,
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
      (_, fileState: IFileState) => {
        if (fileState.filepath == this.getActiveFilepath()) {
          this.setState(() => ({
            activeFileDOM: fileState.dom,
            activeFileProblems: fileState.problems,
            activeFileSaved: fileState.saved,
          }));
        }
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

    // Get monaco instance
    loader.init().then(
      function (monacoInstance: Monaco) {
        this.monaco = monacoInstance;
      }.bind(this)
    );
  }

  getActiveFilepath(): string {
    return this.state.openedFilepaths[this.state.activeFileIndex];
  }

  /*
   Set a file as the active file and update this.state using the response from ipcMain
  */
  setActiveFile(filepath: string | number): void {
    const index =
      typeof filepath == "string"
        ? this.state.openedFilepaths.indexOf(filepath)
        : filepath;
    const newActiveFile = this.state.openedFilepaths[index];
    if (newActiveFile != undefined) {
      ipcRenderer
        .invoke(IPCChannel.GET_FILE_STATE_ASYNC, newActiveFile)
        .then((fileState: IFileState) => {
          this.setState({
            activeFileDOM: fileState.dom,
            activeFileIndex: index,
            activeFileSaved: fileState.saved,
            activeFileReadonly: fileState.readonly,
            activeFileProblems: fileState.problems,
            activeFileType: fileState.fileType as FileType,
          });
        });
    } else {
      this.setState({
        activeFileDOM: undefined,
        activeFileProblems: undefined,
        activeFileReadonly: false,
        activeFileSaved: false,
        activeFileCursorIDOM: undefined,
        activeFileCursorXPath: undefined,
      });
    }
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
      this.state.openedFilepaths[this.state.activeFileIndex]
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
      .then((initialOpenedFile: string[]) => {
        this.setState(
          {
            openedFilepaths: initialOpenedFile,
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
      activeFileCursorIDOM: getNodeFromXPath(prevState.activeFileDOM, path),
    }));
  }

  monacoCursorPositionChangedMath(mathstr: string, startIndex: number, endIndex: number) : void {
    // const cleanedAttributes = mathstr.replace(/cellml:[^</>)]*/mg, '');
    
    if (mathstr != this.state.activeMathString) {
      this.setState(() => ({
        activeMathString: mathstr,
        mathStartIndex: startIndex,
        mathEndIndex: endIndex
      }));
    }

  }

  /*
    Toggle between the Monaco text editor and the graphical editor view
  */
  toggleEditorView(mode: ViewMode): void {
    this.setState(() => ({
      currentMode: mode,
    }));
  }
  
  handleReplaceRange(string: string, startOffset: number, endOffset: number) : void {
    let a;
    // TODO: implement this with edit operations API
    try {
      const model = this.monaco?.editor.getModel(this.monaco.Uri.parse(this.getActiveFilepath()));
      let text = model.getValue();
      text = text.substring(0, startOffset) + string + text.substring(endOffset);
      model.setValue(text);
    } catch {
      console.log('Replace failed')
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

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_OPENED_FILE);
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_FILE_STATE);
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_FILE_CONTENT);
  }

  undo(): void {
    this.textEditorRef?.current?.undo();
  }

  redo(): void {
    this.textEditorRef?.current?.redo();
  }

  render(): React.ReactNode {
    const activeFilepath: string = this.getActiveFilepath();
    return (
      <React.Fragment>
        <TitleMenuBar
          getActiveFilepath={this.getActiveFilepath.bind(this)}
          redoHandler={this.redo.bind(this)}
          undoHandler={this.undo.bind(this)}
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
                      openLibraryComponent={this.openLibraryComponent.bind(
                        this
                      )}
                      filepath={
                        this.state.openedFilepaths[this.state.activeFileIndex]
                      }
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
                      dom={this.state.activeFileDOM}
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
                    openedFiles={this.state.openedFilepaths}
                    activeFileIndex={this.state.activeFileIndex}
                    activeFileSaved={this.state.activeFileSaved}
                    activeFileReadonly={this.state.activeFileReadonly}
                    showToggle={
                      this.state.openedFilepaths.length > 0 &&
                      this.state.activeFileType != "PDF"
                    }
                    onTabClick={this.setActiveFile.bind(this)}
                    onTabClose={this.closeFile.bind(this)}
                    toggleViewMode={this.toggleEditorView.bind(this)}
                  />
                </ReflexElement>
                <ReflexElement className="pane-middle-top primary-bg-dark">
                  <TextEditor
                    ref={this.textEditorRef}
                    hidden={
                      this.state.openedFilepaths.length == 0 ||
                      this.state.activeFileType == "PDF" ||
                      this.state.currentMode != "text"
                    }
                    readonly={this.state.activeFileReadonly}
                    filepath={activeFilepath}
                    defaultValue={this.getDefaultContent(activeFilepath)}
                    problems={this.state.activeFileProblems}
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
                      this.state.openedFilepaths.length == 0 ||
                      this.state.activeFileType != "PDF"
                    }
                  ></PdfViewer>
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-middle-bottom"
                  minSize={25}
                  flex={0.25}
                >
                  <Pane title="Problem">
                    <ProblemPane problems={this.state.activeFileProblems} />
                  </Pane>
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
            <ReflexSplitter className="primary-splitter splitter" />
            <ReflexElement className="pane-right" minSize={150} flex={0.15}>
              <ReflexContainer orientation="horizontal">
                <ReflexElement className="pane-right-top" minSize={25}>
                  <Pane title="Math View" collapsible={false}>
                    <EquationViewer
                      dom={this.state.activeFileDOM}
                      str={this.state.activeMathString}
                      node={this.state.activeFileCursorIDOM}
                      xpath={this.state.activeFileCursorXPath}
                      model={this.monaco?.editor.getModel(this.monaco.Uri.parse(activeFilepath))}
                      start={this.state.mathStartIndex}
                      end={this.state.mathEndIndex}
                      replaceHandler={this.handleReplaceRange.bind(this)}
                    />
                    {/* <EquationContext.Provider value={{mathstr:this.state.activeMathString}}>
                      <EquationViewer/>
                    </EquationContext.Provider> */}
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
