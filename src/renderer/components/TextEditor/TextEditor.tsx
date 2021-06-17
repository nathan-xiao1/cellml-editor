import React from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import "./MonacoLoader";

interface TEProps {
  hidden?: boolean;
  filepath: string;
  defaultValue: string;
  onMountCallback?: () => void;
}

interface TEState {
  currentFile?: string;
}

export default class TextEditor extends React.Component<TEProps, TEState> {
  constructor(props: TEProps) {
    super(props);
  }
  handleEditorWillMount(): void {
    return;
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
        language="xml"
        path={this.props.filepath}
        defaultValue={this.props.defaultValue}
        options={{ minimap: { enabled: false } }}
        beforeMount={this.handleEditorWillMount.bind(this)}
        onMount={this.handleEditorDidMount.bind(this)}
      />
    );
  }
}
