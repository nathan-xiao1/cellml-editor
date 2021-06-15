import React from "react";
import { ipcRenderer } from "electron";
import Header from "./Header/Header";
import ProblemPane from "./Panes/ProblemPane";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import "react-reflex/styles.css";
import "./Editor.scss";

import Pane from "./Panes/Pane";
import TextEditor from "./TextEditor/TextEditor";

interface EditorState {
  openedFiles: string[];
  activeFileIndex: number;
}

export default class Editor extends React.Component<unknown, EditorState> {
  constructor(props: unknown) {
    super(props);
    this.state = { openedFiles: [], activeFileIndex: -1 };

    // Set listener to update openedFile state
    ipcRenderer.on("update-opened-file", (_, arg) => {
      this.setState(() => ({
        openedFiles: arg,
        activeFileIndex: arg.length - 1,
      }));
    });

    // Send IPC command to initialise openedFile state
    ipcRenderer.send("get-opened-file");
  }

  setActiveFile(file: string): void {
    const index = this.state.openedFiles.indexOf(file);
    this.setState({ activeFileIndex: index });
  }

  closeFile(file: string): void {
    ipcRenderer.send("close-file", file);
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners("update-opened-file");
  }

  render(): React.ReactNode {
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
                  openedFiles={this.state.openedFiles}
                  activeFileIndex={this.state.activeFileIndex}
                  onTabClick={this.setActiveFile.bind(this)}
                  onTabClose={this.closeFile.bind(this)}
                />
              </ReflexElement>
              <ReflexElement className="pane-middle-top primary-bg-dark">
                {this.state.openedFiles.length > 0 && (
                  <TextEditor
                    file={this.state.openedFiles[this.state.activeFileIndex]}
                  />
                )}
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
