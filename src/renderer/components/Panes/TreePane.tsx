import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import { IDOM } from "Types";
import "./TreePane.scss";
import "@vscode/codicons/dist/codicon.css";

interface TPProps {
  dom?: IDOM;
  onClickHandler: (lineNum: number) => void;
}

interface IElementIcons {
  [index: string]: string;
}

const ElementIcons: IElementIcons = {
  model: "",
  import: "cloud-download",
  units: "symbol-ruler",
  unit: "symbol-ruler",
  component: "symbol-misc",
  variable: "symbol-variable",
  reset: "debug-restart",
  test_value: "",
  reset_value: "",
  math: "symbol-variable-group",
  encapsulation: "group-by-ref-type",
  component_ref: "references",
  connection: "symbol-interface",
  map_variables: "",
};

export default class TreePane extends React.Component<TPProps> {
  domToTreeItem(dom: IDOM): React.ReactNode {
    if (!dom) return undefined;
    return (
      <TreeItem
        key={dom.id}
        nodeId={dom.id.toString()}
        label={
          <div className="treeitem-label-container">
            <i
              className={`treeitem-label-icon ${dom.name} ${
                ElementIcons[dom.name]
                  ? "codicon codicon-" + ElementIcons[dom.name]
                  : ""
              }`}
            ></i>
            <span className="treeitem-label-text">
              {dom.altName ? dom.altName : dom.name}
            </span>
          </div>
        }
        onLabelClick={(event) => {
          event.preventDefault();
          this.props.onClickHandler(dom.lineNumber);
        }}
      >
        {dom.children.length > 0
          ? dom.children.map((element) => this.domToTreeItem(element))
          : null}
      </TreeItem>
    );
  }

  render(): React.ReactNode {
    if (!this.props.dom) return null;
    return (
      <div className="tree-pane">
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          defaultExpanded={["-1"]}
        >
          {this.props.dom && this.domToTreeItem(this.props.dom)}
        </TreeView>
      </div>
    );
  }
}
