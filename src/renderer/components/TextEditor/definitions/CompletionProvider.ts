/* eslint-disable no-useless-escape */
import monaco, { languages } from "monaco-editor";
import { IContextProvider } from "Types";
import CellMLSchema, { IElement, mathElements } from "./CellMLSchema";
import { TagContextType } from "./ContextProvider";

/*
  Referenced and adapted from https://mono.software/2017/04/11/custom-intellisense-with-monaco-editor/
*/
export default function getCompletionProvider(
  contextProvider: IContextProvider
): monaco.languages.CompletionItemProvider {
  return {
    triggerCharacters: ["<"],
    provideCompletionItems: function () {
      // Get content info - are we inside of the area where we don't want suggestions,
      if (!contextProvider.isCompletionAvailable) {
        return { suggestions: [] };
      }

      // If we want suggestions, inside of which tag are we?
      const lastOpenedTag = contextProvider.lastOpenedTag;
      const lastTag = contextProvider.lastTag;
      console.log("lastTag: ", lastTag);

      // Autosuggest attributes
      if (lastOpenedTag && contextProvider.isAttributeSearch) {
        const suggestions: monaco.languages.CompletionItem[] = [];
        const schemaTag = CellMLSchema.get(lastOpenedTag);
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

      // Autosuggest math elements if inside <math>
      if (lastTag == "math") {
        return {
          triggerCharacters: ["<"],
          suggestions: mathElements.map((element) => ({
            label: element.label,
            kind: languages.CompletionItemKind.Property,
            insertText: element.insertText,
            insertTextRules:
              languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: undefined,
          })),
        };
      }

      // Autosuggest all possible child tags
      // const schemaTag = findElement(openedTags);
      const schemaTag = findElement2(lastTag);
      const nextTagContext = contextProvider.tagContext;
      if (schemaTag) {
        console.log("schemaTag: ", schemaTag);
        const suggestions: monaco.languages.CompletionItem[] = [];
        if (nextTagContext == TagContextType.IN_CLOSE_TAG) {
          if (lastOpenedTag) {
            // Suggest closing tag
            suggestions.push({
              label: lastOpenedTag,
              kind: languages.CompletionItemKind.Property,
              insertText: lastOpenedTag + ">",
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
            if (nextTagContext == TagContextType.NOT_IN_TAG) {
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
}

/*
  Find the current element in the schema according to the list of currently opened tag
  in the editor.
*/
function findElement(openedTags: string[]): IElement {
  console.log("openedTags: ", openedTags);
  if (openedTags.length == 0) return CellMLSchema.get("root");
  let currentSchema: IElement = CellMLSchema.get("root");
  for (let i = 0; i < openedTags.length; i++) {
    for (const childElement of currentSchema.children) {
      if (childElement == openedTags[i]) {
        currentSchema = CellMLSchema.get(childElement);
        break;
      }
      return undefined;
    }
  }
  return currentSchema;
}

function findElement2(lastTag: string): IElement {
  if (lastTag == undefined) return undefined;
  return CellMLSchema.get(lastTag);
}

function getFullSnippet(tagName: string): string {
  return `<${tagName}>\n\t$0\n</${tagName}>`;
}
