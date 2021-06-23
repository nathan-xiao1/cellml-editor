/* eslint-disable no-useless-escape */
import { languages } from "monaco-editor";

/*
Tokeniser to provide syntax highlighting
*/
export default {
  defaultToken: "",

  ignoreCase: true,

  qualifiedName: /(?:[\w\.\-]+:)?[\w\.\-]+/,

  tokenizer: {
    root: [
      // Whitespace
      [/[ \t\r\n]+/, ""],

      // Comments
      [/<!--/, "comment", "@comment"],

      // Standard opening tag
      [
        /(<)(@qualifiedName)/,
        [{ token: "delimiter" }, { token: "tag", next: "@tag" }],
      ],

      // Standard closing tag
      [
        /(<\/)(@qualifiedName)(\s*)(>)/,
        [{ token: "delimiter" }, { token: "tag" }, "", { token: "delimiter" }],
      ],
    ],

    comment: [
      [/-->/, "comment", "@pop"],
      [/[^-]+/, "comment.content"],
      [/./, "comment.content"],
    ],

    tag: [
      [/[ \t\r\n]+/, ""],
      [
        /(@qualifiedName)(\s*=\s*)("[^"]*"|'[^']*')/,
        ["attribute.name", "", "attribute.value"],
      ],
      [
        /(@qualifiedName)(\s*=\s*)("[^">?\/]*|'[^'>?\/]*)(?=[\?\/]\>)/,
        ["attribute.name", "", "attribute.value"],
      ],
      [
        /(@qualifiedName)(\s*=\s*)("[^">]*|'[^'>]*)/,
        ["attribute.name", "", "attribute.value"],
      ],
      [/@qualifiedName/, "attribute.name"],
      [/\?>/, { token: "delimiter", next: "@pop" }],
      [/(\/)(>)/, [{ token: "tag" }, { token: "delimiter", next: "@pop" }]],
      [/>/, { token: "delimiter", next: "@pop" }],
    ],
  },
} as languages.IMonarchLanguage;
