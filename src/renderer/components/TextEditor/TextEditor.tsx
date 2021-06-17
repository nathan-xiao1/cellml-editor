import React from "react";
import Editor from "@monaco-editor/react";
import "./MonacoLoader";

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
        onChange={this.props.onChangeCallback}
        beforeMount={this.handleEditorWillMount.bind(this)}
        onMount={this.handleEditorDidMount.bind(this)}
        options={{ minimap: { enabled: false } }}
      />
    );
  }
}
