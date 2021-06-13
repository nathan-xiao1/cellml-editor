import React from "react";
import Editor from "@monaco-editor/react";
import "./MonacoLoader";

export default class TextEditor extends React.Component {
  render(): React.ReactNode {
    return (
      <Editor
        height="100%"
        theme="vs-dark-custom"
        language="xml"
        options={{ minimap: { enabled: false } }}
      />
    );
  }
}
