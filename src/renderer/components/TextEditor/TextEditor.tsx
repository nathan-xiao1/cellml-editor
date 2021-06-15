import React from "react";
import Editor from "@monaco-editor/react";
import "./MonacoLoader";

interface TEProps {
  file: string;
}

interface TEState {
  currentFile?: string;
}

export default class TextEditor extends React.Component<TEProps, TEState> {
  constructor(props: TEProps) {
    super(props);
  }

  render(): React.ReactNode {
    return (
      <Editor
        height="100%"
        theme="vs-dark-custom"
        language="xml"
        path={this.props.file}
        value={this.props.file}
        options={{ minimap: { enabled: false } }}
      />
    );
  }
}
