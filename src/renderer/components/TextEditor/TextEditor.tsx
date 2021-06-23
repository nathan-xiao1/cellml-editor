import React from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import CellMLTokeniser from "./definitions/Tokeniser";
import CellMLCompletionProvider from "./definitions/CompletionProvider";
import CellMLDocumentFormattingProvider from "./definitions/FormattingProvider";
import "./MonacoLoader";

const CellMLID = "CellML2";

interface TEProps {
  hidden?: boolean;
  filepath: string;
  defaultValue: string;
  onMountCallback?: () => void;
  onChangeCallback?: (content: string) => void;
}

interface TEState {
  currentFile?: string;
}

export default class TextEditor extends React.Component<TEProps, TEState> {
  constructor(props: TEProps) {
    super(props);
  }

  handleEditorWillMount(monaco: Monaco): void {
    monaco.languages.register({ id: CellMLID });
    monaco.languages.setMonarchTokensProvider(CellMLID, CellMLTokeniser);
    monaco.languages.registerCompletionItemProvider(
      CellMLID,
      CellMLCompletionProvider
    );
    monaco.languages.registerDocumentFormattingEditProvider(
      CellMLID,
      CellMLDocumentFormattingProvider
    );
  }

  handleEditorDidMount(): void {
    this.props.onMountCallback();
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
        onChange={this.props.onChangeCallback}
        beforeMount={this.handleEditorWillMount.bind(this)}
        onMount={this.handleEditorDidMount.bind(this)}
        options={{ minimap: { enabled: false } }}
      />
    );
  }
}
