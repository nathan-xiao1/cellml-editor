import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

/*
 Change default source of the monaco files from using CDN to node_modules'.
 Files are copied from node_modules to 'build' by webpack
 */
loader.config({
  paths: {
    vs: "vs"
  },
});

/*
 Custom Theme Definition
*/
const themeRules: monaco.editor.ITokenThemeRule[] = [
  { token: "comment", foreground: "ffa500", fontStyle: "italic underline" },
  { token: "comment.js", foreground: "008800", fontStyle: "bold" },
  { token: "comment.css", foreground: "0000ff" },
];

loader.init().then((monaco) => {
  monaco.editor.defineTheme("vs-dark-custom", {
    base: "vs-dark",
    inherit: true,
    rules: themeRules,
    colors: {
      "editor.background": "#00000000",
    },
  } as monaco.editor.IStandaloneThemeData);
});
