import React, { createRef } from "react";
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
import { FileType, IDOM, IFileState, IProblemItem } from "Types";
import TreePane from "./Panes/TreePane";

import VisualPane from "./Panes/VisualPane";
import CreateImgModel from "./CreateImgModel";

type Mode = "text" | "graphical";

let graphics_or_text = 0;

const testpath123 = "C:\\Users\\admin\\Downloads\\finalversion\\cellml-editor\\example\\SodiumChannelModel.cellml";

interface EditorState {
  currentMode: Mode;
  openedFilepaths: string[];
  activeFileIndex: number;
  activeFileProblems: IProblemItem[];
  activeFileType: FileType;
  activeFileDOM: IDOM;
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
            activeFileDOM: fileState.dom,
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
            activeFileDOM: fileState.dom,
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
    this.monaco?.editor.getModel(this.monaco.Uri.parse(filepath)).dispose();
    ipcRenderer.send(IPCChannel.CLOSE_FILE, filepath);
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
    Toggle between the Monaco text editor and the graphical editor view
  */
  toggleEditorView(): void {
    this.setState((prevState) => ({
      currentMode: prevState.currentMode == "text" ? "graphical" : "text",
    }));
  }

  domTreeClickHandler(lineNum: number): void {
    this.textEditorRef.current?.goToLine(lineNum);
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_OPENED_FILE);
  }




  changemodel(): void {
    console.log('change model');
    console.log(graphics_or_text);
    // change mode to allow the user to generate their own model 
    (graphics_or_text === 0) ? graphics_or_text = 1: graphics_or_text = 0;
    console.log(graphics_or_text);

    // if changed to text --> deafult text view
    if (graphics_or_text === 0) {
      document.getElementById("user_model_creator").style.display = 'none';

      const pmh = document.getElementsByClassName('pane-middle-header') as HTMLCollectionOf<HTMLElement>;
      pmh[0].style.display = 'block';
      const pmt = document.getElementsByClassName('pane-middle-top') as HTMLCollectionOf<HTMLElement>;
      pmt[0].style.display = 'block';
      const pmb = document.getElementsByClassName('pane-middle-bottom') as HTMLCollectionOf<HTMLElement>;
      pmb[0].style.display = 'block';
    } 
    // if in graphics view then display create page panel
    else {
      document.getElementById("user_model_creator").style.display = 'block';
      
      const pmh = document.getElementsByClassName('pane-middle-header') as HTMLCollectionOf<HTMLElement>;
      pmh[0].style.display = 'none';
      const pmt = document.getElementsByClassName('pane-middle-top') as HTMLCollectionOf<HTMLElement>;
      pmt[0].style.display = 'none';
      const pmb = document.getElementsByClassName('pane-middle-bottom') as HTMLCollectionOf<HTMLElement>;
      pmb[0].style.display = 'none';
      
    }
  }

  

  render(): React.ReactNode {
    const activeFilepath: string = this.getActiveFilepath();
    return (
      <React.Fragment>
        <TitleMenuBar getActiveFilepath={this.getActiveFilepath.bind(this)} />
        <div className="editor-container primary-bg primary-text">
          <ReflexContainer orientation="vertical" windowResizeAware={true}>
            <ReflexElement className="pane-left" minSize={150} flex={0.15}>
              <ReflexContainer orientation="horizontal">
                <ReflexElement className="pane-left-top" minSize={25}>
                  <Pane title="Left Top" collapsible={false}></Pane>
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-left-bottom"
                  minSize={25}
                  flex={0.4}
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

             {/*<button onClick={()=>{console.log(activeFilepath); this.setActiveFile(testpath123)}}></button>*/}   

                <button id="create_new_model_img" onClick={this.changemodel}>Create New Model</button>
                <div id="tempposition">
                  -
                </div>

                <div id="user_model_creator">
                  <CreateImgModel></CreateImgModel>
                </div>
                
                  <ReflexElement className="pane-middle-header" size={25}>
                    <Header
                      openedFiles={this.state.openedFilepaths}
                      activeFileIndex={this.state.activeFileIndex}
                      onTabClick={this.setActiveFile.bind(this)}
                      onTabClose={this.closeFile.bind(this)}
                      onViewToggle={this.toggleEditorView.bind(this)}
                    />
                  </ReflexElement>
                  <ReflexElement className="pane-middle-top primary-bg-dark">
                    {/*<button onClick={()=>console.log(activeFilepath)}>TestBtn</button>*/}
                    <TextEditor
                      ref={this.textEditorRef}
                      hidden={
                        this.state.openedFilepaths.length == 0 ||
                        this.state.activeFileType == "PDF" ||
                        this.state.currentMode != "text"
                      }
                      filepath={activeFilepath}
                      defaultValue={this.getDefaultContent(activeFilepath)}
                      problems={this.state.activeFileProblems}
                      onMountCallback={this.monacoOnMountCallback.bind(this)}
                      onChangeCallback={this.monacoOnChangeCallback.bind(this)}
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
                  <Pane title="Math View" collapsible={false}></Pane>
                </ReflexElement>
                <ReflexSplitter className="primary-splitter splitter" />
                <ReflexElement
                  className="pane-right-bottom"
                  minSize={25}
                  flex={0.4}
                >
                  <Pane title="Right Bottom" collapsible={false}>
                    <VisualPane
                      dom={this.state.activeFileDOM}
                      filepath={activeFilepath}
                      onClickHandler={this.domTreeClickHandler.bind(this)}
                    />
                  </Pane>
                </ReflexElement>
              </ReflexContainer>
            </ReflexElement>
          </ReflexContainer>
        </div>
      </React.Fragment>
    );
  }
}
