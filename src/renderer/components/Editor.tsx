import React from "react";
import IPCChannel from "IPCChannels";
import { ipcRenderer } from "electron";
import { loader, Monaco } from "@monaco-editor/react";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import "react-reflex/styles.css";
import "./Editor.scss";

import Header from "./Header/Header";
import Pane from "./Panes/Pane";
import ProblemPane from "./Panes/ProblemPane";
import TextEditor from "./TextEditor/TextEditor";
import TitleMenuBar from "./TitleMenuBar/TitleMenuBar";
import PdfViewer from "./PdfViewer/PdfViewer";
import { FileType, IFileState, IProblemItem } from "Types";

interface EditorState {
  openedFilepaths: string[];
  activeFileIndex: number;
  activeFileProblems: IProblemItem[];
  activeFileType: FileType;
}

export default class Editor extends React.Component<unknown, EditorState> {
  private initialisedFiles: Set<string>;
  private monaco: Monaco;

  constructor(props: unknown) {
    super(props);
    this.initialisedFiles = new Set();
    this.state = {
      openedFilepaths: [],
      activeFileIndex: -1,
      activeFileProblems: [],
      activeFileType: undefined,
    };

    // Set listener to update openedFile state
    ipcRenderer.on(IPCChannel.RENDERER_UPDATE_OPENED_FILE, (_, arg) => {
      this.setState(
        {
          openedFilepaths: arg,
        },
        () => {
          this.setActiveFile(arg.length - 1);
        }
      );
    });

    // Set listener to update this.state using file state from ipcMain
    ipcRenderer.on(
      IPCChannel.RENDERER_UPDATE_FILE_STATE,
      (_, fileState: IFileState) => {
        if (fileState.filepath == this.getActiveFilepath()) {
          this.setState(() => ({
            activeFileProblems: fileState.problems,
          }));
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
            activeFileIndex: index,
            activeFileProblems: fileState.problems,
            activeFileType: fileState.fileType as FileType,
          });
        });
    } else {
      this.setState({
        activeFileProblems: [],
      });
    }
  }

  /*
   Close a file by notifying ipcMain and deleting Monaco's model of the fle
  */
  closeFile(filepath: string): void {
    this.initialisedFiles.delete(filepath);
    console.log(this.monaco.Uri.parse(filepath));
    console.log(this.monaco.editor.getModels());
    this.monaco?.editor.getModel(this.monaco.Uri.parse(filepath)).dispose();
    ipcRenderer.send(IPCChannel.CLOSE_FILE, filepath);
  }

  /*
   Get file content to initialise Monaco's defaultValue only if the file hasn't 
   been initialied before
  */
  getDefaultContent(filepath: string): string {
    if (this.initialisedFiles.has(filepath)) {
      console.log(`${filepath} already initialised`);
      return null;
    }
    console.log(`${filepath} not initialised`);
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

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_OPENED_FILE);
  }

  render(): React.ReactNode {
    const activeFilepath: string = this.getActiveFilepath();
    return (
      <React.Fragment>
        <TitleMenuBar getActiveFilepath={this.getActiveFilepath.bind(this)} />
        <div className="editor-container primary-bg primary-text">
          <ReflexContainer orientation="vertical" windowResizeAware={true}>
            <ReflexElement className="pane-left" minSize={150} flex={0.15}>
              Left
            </ReflexElement>
            <ReflexSplitter className="primary-splitter splitter" />
            <ReflexElement className="pane-middle">
              <ReflexContainer orientation="horizontal">
                <ReflexElement className="pane-middle-header" size={35}>
                  <Header
                    openedFiles={this.state.openedFilepaths}
                    activeFileIndex={this.state.activeFileIndex}
                    onTabClick={this.setActiveFile.bind(this)}
                    onTabClose={this.closeFile.bind(this)}
                  />
                </ReflexElement>
                <ReflexElement className="pane-middle-top primary-bg-dark">
                  <TextEditor
                    hidden={
                      this.state.openedFilepaths.length == 0 ||
                      this.state.activeFileType != "CellML"
                    }
                    filepath={activeFilepath}
                    defaultValue={this.getDefaultContent(activeFilepath)}
                    onMountCallback={this.monacoOnMountCallback.bind(this)}
                    onChangeCallback={this.monacoOnChangeCallback.bind(this)}
                  />
                  <PdfViewer
                    hidden={
                      this.state.openedFilepaths.length == 0 ||
                      this.state.activeFileType != "PDF"
                    }></PdfViewer>
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-middle-bottom"
                  minSize={50}
                  flex={0.25}>
                  <Pane title="Problem">
                    <ProblemPane problems={this.state.activeFileProblems} />
                  </Pane>
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
            <ReflexSplitter className="primary-splitter splitter" />
            <ReflexElement className="pane-right" minSize={150} flex={0.15}>
              Right
            </ReflexElement>
          </ReflexContainer>
        </div>
      </React.Fragment>
    );
  }
}
