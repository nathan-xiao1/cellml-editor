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

interface EditorState {
  openedFilepaths: string[];
  activeFileIndex: number;
}

export default class Editor extends React.Component<unknown, EditorState> {
  private initialisedFiles: Set<string>;
  private monaco: Monaco;

  constructor(props: unknown) {
    super(props);
    this.initialisedFiles = new Set();

    this.state = { openedFilepaths: [], activeFileIndex: -1 };

    // Set listener to update openedFile state
    ipcRenderer.on(IPCChannel.RENDERER_UPDATE_OPENED_FILE, (_, arg) => {
      this.setState(() => ({
        openedFilepaths: arg,
        activeFileIndex: arg.length - 1,
      }));
    });

    // Get monaco instance
    loader.init().then(
      function (monacoInstance: Monaco) {
        this.monaco = monacoInstance;
      }.bind(this)
    );
  }

  getActiveFile(): string {
    return this.state.openedFilepaths[this.state.activeFileIndex];
  }

  setActiveFile(filepath: string): void {
    const index = this.state.openedFilepaths.indexOf(filepath);
    this.setState({ activeFileIndex: index });
  }

  closeFile(filepath: string): void {
    this.initialisedFiles.delete(filepath);
    this.monaco?.editor.getModel(this.monaco.Uri.parse(filepath)).dispose();
    ipcRenderer.send(IPCChannel.CLOSE_FILE, filepath);
  }

  // Get file content to initialise Monaco's defaultValue
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

  monacoOnChangeCallback(content: string): void {
    ipcRenderer.send(
      IPCChannel.UPDATE_FILE_CONTENT,
      this.getActiveFile(),
      content
    );
  }

  monacoOnMountCallback(): void {
    // Send IPC command to initialise openedFile states
    ipcRenderer
      .invoke(IPCChannel.GET_OPENED_FILEPATHS_ASYNC)
      .then((initialOpenedFile: string[]) => {
        this.setState(() => ({
          openedFilepaths: initialOpenedFile,
          activeFileIndex: initialOpenedFile.length - 1,
        }));
      });
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_OPENED_FILE);
  }

  render(): React.ReactNode {
    const activeFilepath: string = this.getActiveFile();
    return (
      <React.Fragment>
        <TitleMenuBar getActiveFilepath={this.getActiveFile.bind(this)} />
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
                    hidden={this.state.openedFilepaths.length == 0}
                    filepath={activeFilepath}
                    defaultValue={this.getDefaultContent(activeFilepath)}
                    onMountCallback={this.monacoOnMountCallback.bind(this)}
                    onChangeCallback={this.monacoOnChangeCallback.bind(this)}
                  />
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-middle-bottom"
                  minSize={50}
                  flex={0.25}>
                  <Pane title="Problem">
                    <ProblemPane />
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
