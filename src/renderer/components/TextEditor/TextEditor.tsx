import React from "react";
import monaco, { editor, MarkerSeverity } from "monaco-editor";
import Editor, { Monaco } from "@monaco-editor/react";
import autoTagClose from "./definitions/AutoTagClose";
import ContextProvider from "./definitions/ContextProvider";
import CellMLTokeniser from "./definitions/Tokeniser";
import CellMLCompletionProvider from "./definitions/CompletionProvider";
import CellMLDocumentFormattingProvider from "./definitions/FormattingProvider";
import CellMLLanguageConfiguration from "./definitions/LanguageConfiguration";
import CellMLHoverProvider from "./definitions/HoverProvider";
import CellMLFormattingProvider from "./definitions/FormattingProvider";
import { getXPath } from "src/commons/utils/xpath";
import { IProblemItem } from "Types";
import IPCChannel from "IPCChannels";
import findApplyMatch, { findApplyMatches } from "../EquationViewer/regexApply";

import "./MonacoLoader";
import { ipcRenderer } from "electron";
import { mathElements } from "src/commons/CellMLSchema";
import { ALPN_ENABLED } from "constants";
import { match } from "assert";

const CellMLID = "CellML2";

interface TEProps {
  hidden?: boolean;
  readonly: boolean;
  filepath: string;
  defaultValue: string;
  problems: IProblemItem[];
  exportComponentHandler: () => void;
  onMountCallback?: () => void;
  onChangeCallback?: (content: string) => void;
  onCursorPositionChangedCallback?: (path: string) => void;
  onCursorPositionChangedMath?: (mathstr: string, startIndex: number, endIndex: number, mathTagIncluded: boolean) => void;
}

interface TEState {
  currentFile?: string;
}

export default class TextEditor extends React.Component<TEProps, TEState> {
  private monacoInstance: Monaco;
  private editorInstance: monaco.editor.IStandaloneCodeEditor;
  private contextProvider: ContextProvider;
  // public currentMathElement: string;
  constructor(props: TEProps) {
    super(props);
    this.contextProvider = new ContextProvider();
    // this.currentMathElement = "";
  }

  // prettier-ignore
  handleEditorWillMount(monacoInstance: Monaco): void {
    this.monacoInstance = monacoInstance;
    monacoInstance.languages.register({ id: CellMLID });
    monacoInstance.languages.setMonarchTokensProvider(CellMLID, CellMLTokeniser);
    monacoInstance.languages.registerCompletionItemProvider(CellMLID, CellMLCompletionProvider(this.contextProvider));
    monacoInstance.languages.registerDocumentFormattingEditProvider(CellMLID, CellMLDocumentFormattingProvider);
    monacoInstance.languages.setLanguageConfiguration(CellMLID, CellMLLanguageConfiguration);
    monacoInstance.languages.registerHoverProvider(CellMLID, CellMLHoverProvider);
    monacoInstance.languages.registerDocumentFormattingEditProvider(CellMLID, CellMLFormattingProvider);
    monacoInstance.editor.onDidCreateModel((model) => {
      this.highlightErrors(this.props.problems, model);
    })
  }

  handleEditorDidMount(
    editorInstance: monaco.editor.IStandaloneCodeEditor
  ): void {
    this.editorInstance = editorInstance;
    // set up handler to check cursor position

    this.props.onMountCallback();

    // Register callback for cursor position change event
    this.editorInstance.onDidChangeCursorPosition(
      (event: editor.ICursorPositionChangedEvent) => {
        const model = this.editorInstance.getModel();
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: event.position.lineNumber,
          endColumn: model.getLineLength(event.position.lineNumber) + 1,
        });
        // If element selected is in math component, send math string for eq viewer
        const xpath = getXPath(textUntilPosition);
        this.props.onCursorPositionChangedCallback(xpath);
        
        const offset = model.getOffsetAt(event.position);

        const str = model.getValue();
        const startre = /<\s*math.*>/gm;
        const endre = /<\s*\/math\s*>/gm;

        // Finding matches for starting math tag
        const startMatches = [...str.matchAll(startre)];
        let start = null;
        for (const match of startMatches) {
          if (match.index < offset) {
            start = match.index;
          }
        }
        
        // Matches for starting end tag, send if start < cursorOffset < end
        const endMatches = [...str.matchAll(endre)];
        let end;
        if (start) {
          let i = endMatches.length - 1;
          while (i >= 0) {
            const match = endMatches[i];
            const endIndex = match.index + match[0].length;
            if (endIndex > offset) {
              end = endIndex;
            }
            i--;
          }
        }

        // If math component found within offset
        if (start && end) {
          
          // Find appropriate apply
          // const r = findApplyMatch(str.slice(start, end), offset - start);
          // if (r.foundMatch && r.multipleApplies) {
          //   const endOff = r.endOff + start;
          //   const startOff = r.startOff + start;
          //   console.log('Apply Match: ', str.slice(startOff, endOff));
          // }
          let mathTagIncluded = true;
          const r = findApplyMatches(str.slice(start, end));
          if (r.length > 1) {
            for (const res of r) {
              if (res.startOff <= offset - start && offset - start <= res.endOff) {
                // console.log('Apply Match: ', res, str.slice(start + res.startOff, start + res.endOff));
                end = start + res.endOff;
                start = start + res.startOff;
                mathTagIncluded = false;
              }
            }
          }

          this.props.onCursorPositionChangedMath(str.slice(start, end), start, end, mathTagIncluded);
        } else {
          this.props.onCursorPositionChangedMath('', undefined, undefined, true);
        }
        
      }
    );

    // Register new context menu action
    this.editorInstance.addAction({
      id: "export-component",
      label: "Export component",
      contextMenuGroupId: "import-export",
      contextMenuOrder: 0,
      run: () => {
        this.props.exportComponentHandler();
      },
    });

    // Register shortcuts
    this.editorInstance.addAction({
      id: "save-file",
      label: "Save file",
      keybindings: [
        this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyCode.KEY_S,
      ],
      run: () => ipcRenderer.send(IPCChannel.SAVE_FILE, this.props.filepath),
    });
    this.editorInstance.addAction({
      id: "open-file",
      label: "Open file",
      keybindings: [
        this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyCode.KEY_O,
      ],
      run: () => ipcRenderer.send(IPCChannel.OPEN_FILE),
    });
    this.editorInstance.addAction({
      id: "new-file",
      label: "New file",
      keybindings: [
        this.monacoInstance.KeyMod.CtrlCmd | this.monacoInstance.KeyCode.KEY_N,
      ],
      run: () => ipcRenderer.send(IPCChannel.NEW_FILE),
    });
  }

  handleContentOnChange(
    value: string,
    event: monaco.editor.IModelContentChangedEvent
  ): void {
    const position = this.editorInstance.getPosition();
    const textUntilPosition = this.editorInstance.getModel().getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column + 1,
    });
    this.contextProvider.update(textUntilPosition);
    this.props.onChangeCallback(value);
    autoTagClose(this.contextProvider, this.editorInstance, event);
  }

  highlightErrors(
    errors: IProblemItem[],
    model?: monaco.editor.ITextModel
  ): void {
    if (!errors) return;
    if (!model) {
      model = this.editorInstance?.getModel();
      if (!model) return;
    }
    const fullRange = model.getFullModelRange();
    const markers: monaco.editor.IMarkerData[] = [];
    errors.forEach((error) => {
      let severity;
      switch (error.severity) {
        case "hint":
          severity = MarkerSeverity.Hint;
          break;
        case "warning":
          severity = MarkerSeverity.Warning;
          break;
        case "info":
          severity = MarkerSeverity.Info;
          break;
        default:
          severity = MarkerSeverity.Error;
          break;
      }
      if (
        error.startLineNumber < fullRange.startLineNumber ||
        error.endLineNumber > fullRange.endLineNumber
      )
        return;
      markers.push({
        severity: severity,
        message: error.description,
        startColumn: model.getLineFirstNonWhitespaceColumn(
          error.startLineNumber
        ),
        endColumn: model.getLineLastNonWhitespaceColumn(error.endLineNumber),
        startLineNumber: error.startLineNumber,
        endLineNumber: error.endLineNumber,
      });
    });
    this.monacoInstance?.editor.setModelMarkers(model, CellMLID, markers);
  }

  goToLine(lineNum: number): void {
    this.editorInstance.focus();
    this.editorInstance.revealLineInCenter(lineNum);
    this.editorInstance.setPosition({
      lineNumber: lineNum,
      column: this.editorInstance.getModel().getLineLength(lineNum) + 1,
    });
  }

  setValue(value: string): void {
    const position = this.editorInstance.getPosition();
    const range = this.editorInstance.getModel().getFullModelRange();
    this.editorInstance.executeEdits(null, [
      {
        text: value,
        range: range,
      },
    ]);
    this.editorInstance.getAction("editor.action.formatDocument").run();
    this.editorInstance.setPosition(position);
  }

  componentDidUpdate(prevProps: TEProps): void {
    if (prevProps.problems != this.props.problems) {
      this.highlightErrors(this.props.problems);
    }
  }

  undo(): void {
    this.editorInstance.trigger("keyboard", "undo", null);
    this.editorInstance.focus();
  }

  redo(): void {
    this.editorInstance.trigger("keyboard", "redo", null);
  }

  render(): React.ReactNode {
    return (
      <Editor
        wrapperClassName={this.props.hidden ? "hidden" : ""}
        height="100%"
        theme="vs-dark-custom"
        language={CellMLID}
        path={this.props.filepath}
        defaultValue={this.props.defaultValue}
        onChange={this.handleContentOnChange.bind(this)}
        beforeMount={this.handleEditorWillMount.bind(this)}
        onMount={this.handleEditorDidMount.bind(this)}
        options={{ minimap: { enabled: false }, readOnly: this.props.readonly }}
      />
    );
  }
}
