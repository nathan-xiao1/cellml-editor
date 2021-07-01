/* eslint-disable no-useless-escape */
import { languages } from "monaco-editor";

// Referenced from: https://github.com/redhat-developer/vscode-xml/blob/master/src/client/indentation.ts
const languageConfig : languages.LanguageConfiguration = {
  indentationRules: {
    increaseIndentPattern: /<(?!\?|[^>]*\/>)([-_\.A-Za-z0-9]+)(?=\s|>)\b[^>]*>(?!.*<\/\1>)|<!--(?!.*-->)|\{[^}"']*$/,
    decreaseIndentPattern: /^\s*(<\/[-_\.A-Za-z0-9]+\b[^>]*>|-->|\})/
  },
  onEnterRules: [
    {
      beforeText: new RegExp(`<([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
      afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
      action: { indentAction: languages.IndentAction.IndentOutdent }
    },
    {
      beforeText: new RegExp(`<(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
      action: { indentAction: languages.IndentAction.Indent }
    }
  ]
};

export default languageConfig;