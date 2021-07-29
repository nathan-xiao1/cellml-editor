/* eslint-disable no-useless-escape */
import { IContextProvider } from "Types";

export enum TagContextType {
  NOT_IN_TAG,
  IN_CLOSE_TAG,
  IN_OPEN_TAG,
}

export default class ContextProvider implements IContextProvider {
  private _isCompletionAvailable: boolean;
  private _clearedText: string;
  private _lastOpenedTag: string;
  private _isAttributeSearch: boolean;
  private _tagContext: TagContextType;
  private _tagContextPrev: TagContextType;
  private _lastTag: string;

  public get isCompletionAvailable(): boolean {
    return this._isCompletionAvailable;
  }

  public get clearedText(): string {
    return this._clearedText;
  }

  public get lastOpenedTag(): string {
    return this._lastOpenedTag;
  }

  public get isAttributeSearch(): boolean {
    return this._isAttributeSearch;
  }

  public get tagContext(): TagContextType {
    return this._tagContext;
  }

  public get tagContextPrev(): TagContextType {
    return this._tagContextPrev;
  }

  public get lastTag(): string {
    return this._lastTag;
  }

  update(content: string): void {
    const areaInfo = _getAreaInfo(content);
    this._tagContextPrev = this._tagContext;
    this._tagContext = _getTagContext(content);
    this._lastOpenedTag = _getLastOpenedTag(content)?.tagName;
    this._isCompletionAvailable = areaInfo.isCompletionAvailable;
    this._clearedText = areaInfo.clearedText;
    this._lastTag = _getLastTag(content);
  }
}

function _getAreaInfo(text: string): {
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

function _getLastOpenedTag(text: string): {
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

function _getTagContext(text: string): TagContextType {
  const match = text.match(/(<\/?|>)[^</>]*$/)?.[1];
  if (!match) return TagContextType.NOT_IN_TAG;
  switch (match) {
    case "<":
      return TagContextType.IN_OPEN_TAG;
    case "</":
      return TagContextType.IN_CLOSE_TAG;
    case ">":
      return TagContextType.NOT_IN_TAG;
  }
}

function _getLastTag(text: string): string {
  const matches = text.match(/<(?=\S*)([a-zA-Z-_]+)[^<>]*\/?>/g);
  if (!matches) return "root";
  return matches[matches.length - 1].match(/<([a-zA-Z-_]+)/)[1];
}
