/* eslint-disable no-useless-escape */
import monaco, { languages } from "monaco-editor";
import CellMLSchema, { IElement } from "./CellMLSchema";

/*
  Referenced and adapted from https://mono.software/2017/04/11/custom-intellisense-with-monaco-editor/
*/
const completionProvider: monaco.languages.CompletionItemProvider = {
  triggerCharacters: ["<"],
  provideCompletionItems: function (
    model: monaco.editor.ITextModel,
    position: monaco.Position
  ) {
    // Get editor content before the pointer
    const textUntilPosition = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    // Get content info - are we inside of the area where we don't want suggestions,
    const areaUntilPositionInfo = getAreaInfo(textUntilPosition);
    if (!areaUntilPositionInfo.isCompletionAvailable) {
      return { suggestions: [] };
    }

    // If we want suggestions, inside of which tag are we?
    const openedTags = [];
    const lastOpenedTag = getLastOpenedTag(areaUntilPositionInfo.clearedText);
    if (lastOpenedTag) {
      // Parse the content (not cleared text) into an XML document
      const xmlDoc = stringToXML(textUntilPosition);
      let lastChild = xmlDoc.lastElementChild;
      while (lastChild) {
        openedTags.push(lastChild.tagName);
        lastChild = lastChild.lastElementChild;
      }
    }

    // Autosuggest attributes
    if (lastOpenedTag && lastOpenedTag.isAttributeSearch) {
      const suggestions: monaco.languages.CompletionItem[] = [];
      const schemaTag = CellMLSchema.get(lastOpenedTag.tagName);
      if (schemaTag == undefined) return { suggestions: suggestions };
      schemaTag.attributes.forEach((attribute) => {
        suggestions.push({
          label: attribute,
          kind: languages.CompletionItemKind.Property,
          insertText: `${attribute}="$1"`,
          insertTextRules:
            languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range: undefined,
        });
      });
      return { suggestions: suggestions };
    }

    // Autosuggest all possible child tags
    const schemaTag = findElement(openedTags);
    const nextTagContext = getContext(textUntilPosition);
    if (schemaTag) {
      const suggestions: monaco.languages.CompletionItem[] = [];
      if (nextTagContext == ContextType.CLOSE_TAG) {
        if (lastOpenedTag) {
          // Suggest closing tag
          suggestions.push({
            label: lastOpenedTag.tagName,
            kind: languages.CompletionItemKind.Property,
            insertText: lastOpenedTag.tagName + ">",
            insertTextRules:
              languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: undefined,
          });
        }
      } else {
        // Suggest opening tag
        schemaTag.children.forEach((elementName) => {
          const element: IElement = CellMLSchema.get(elementName);
          let insertText;
          if (nextTagContext == ContextType.OPEN_TAG) {
            insertText = element.insertSnippet
              ? element.insertSnippet
              : getFullSnippet(element.insertText);
          } else {
            insertText = element.insertText;
          }
          suggestions.push({
            label: element.label,
            kind: languages.CompletionItemKind.Property,
            insertText: insertText,
            insertTextRules:
              languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: undefined,
          });
        });
      }
      return { triggerCharacters: ["<"], suggestions: suggestions };
    }
    return { suggestions: [] };
  },
};

function stringToXML(text: string): XMLDocument {
  const parser = new DOMParser();
  return parser.parseFromString(text, "text/xml");
}

function getAreaInfo(text: string): {
  isCompletionAvailable: boolean;
  clearedText: string;
} {
  // Opening for strings, comments and CDATA
  const items = ['"', "'", "<!--", "<![CDATA["];
  let isCompletionAvailable = true;
  // Remove all comments, strings and CDATA
  text = text.replace(
    /"([^"\\]*(\\.[^"\\]*)*)"|\'([^\'\\]*(\\.[^\'\\]*)*)\'|<!--([\s\S])*?-->|<!\[CDATA\[(.*?)\]\]>/g,
    ""
  );
  for (let i = 0; i < items.length; i++) {
    const itemIdx = text.indexOf(items[i]);
    if (itemIdx > -1) {
      text = text.substring(0, itemIdx);
      isCompletionAvailable = false;
    }
  }
  return {
    isCompletionAvailable: isCompletionAvailable,
    clearedText: text,
  };
}

function getLastOpenedTag(text: string): {
  tagName: string;
  isAttributeSearch: boolean;
} {
  // Get all tags inside of the content
  const tags = text.match(/<\/*(?=\S*)([a-zA-Z-_]+)/g);
  if (!tags) {
    return undefined;
  }
  // Need to know which tags are closed
  const closingTags = [];
  for (let i = tags.length - 1; i >= 0; i--) {
    if (tags[i].indexOf("</") === 0) {
      closingTags.push(tags[i].substring("</".length));
    } else {
      // Get the last position of the tag
      const tagPosition = text.lastIndexOf(tags[i]);
      const tag = tags[i].substring("<".length);
      const closingBracketIdx = text.indexOf("/>", tagPosition);
      // If the tag wasn't closed
      if (closingBracketIdx === -1) {
        // If there are no closing tags or the current tag wasn't closed
        if (
          !closingTags.length ||
          closingTags[closingTags.length - 1] !== tag
        ) {
          // We found our tag, but let's get the information if we are looking for
          // a child element or an attribute
          text = text.substring(tagPosition);
          return {
            tagName: tag,
            isAttributeSearch: text.indexOf("<") > text.indexOf(">"),
          };
        }
        // Remove the last closed tag
        closingTags.splice(closingTags.length - 1, 1);
      }
      // Remove the last checked tag and continue processing the rest of the content
      text = text.substring(0, tagPosition);
    }
  }
}

/*
  Find the current element in the schema according to the list of currently opened tag
  in the editor.
*/
function findElement(openedTags: string[]): IElement {
  if (openedTags.length == 0) return CellMLSchema.get("root");
  let currentSchema: IElement = CellMLSchema.get("root");
  for (let i = 0; i < openedTags.length; i++) {
    for (const childElement of currentSchema.children) {
      if (childElement == openedTags[i]) {
        currentSchema = CellMLSchema.get(childElement);
        break;
      }
    }
  }
  return currentSchema;
}

const enum ContextType {
  OPEN_TAG,
  CLOSE_TAG,
  IN_TAG,
}

function getContext(text: string): ContextType {
  const match = text.match(/(<\/?|>)[\s\v\w]*$/)?.[1];
  if (!match) return ContextType.OPEN_TAG;
  console.log("Match: ", match);
  switch (match) {
    case "<":
      return ContextType.IN_TAG;
    case "</":
      return ContextType.CLOSE_TAG;
    case ">":
      return ContextType.OPEN_TAG;
  }
}

function getFullSnippet(tagName: string): string {
  return `<${tagName}>\n\t$0\n</${tagName}>`;
}

export default completionProvider;
