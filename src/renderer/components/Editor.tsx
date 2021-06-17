import React from "react";
import { ipcRenderer } from "electron";
import { loader, Monaco } from "@monaco-editor/react";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import "react-reflex/styles.css";
import "./Editor.scss";

import Header from "./Header/Header";
import Pane from "./Panes/Pane";
import ProblemPane from "./Panes/ProblemPane";
import TextEditor from "./TextEditor/TextEditor";

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
    ipcRenderer.on("update-opened-file", (_, arg) => {
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

  setActiveFile(filepath: string): void {
    const index = this.state.openedFilepaths.indexOf(filepath);
    this.setState({ activeFileIndex: index });
  }

  closeFile(filepath: string): void {
    this.initialisedFiles.delete(filepath);
    this.monaco.editor.getModel(this.monaco.Uri.parse(filepath)).dispose();
    ipcRenderer.send("close-file", filepath);
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
      "get-file-content",
      this.state.openedFilepaths[this.state.activeFileIndex]
    );
  }

  monacoOnMountCallback(): void {
    // Send IPC command to initialise openedFile states
    const initialOpenedFile = ipcRenderer.sendSync("get-opened-file-sync");
    this.setState(() => ({
      openedFilepaths: initialOpenedFile,
      activeFileIndex: initialOpenedFile.length - 1,
    }));
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners("update-opened-file");
  }

  render(): React.ReactNode {
    const activeFilepath: string =
      this.state.openedFilepaths[this.state.activeFileIndex];
    return (
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
    );
  }
}
