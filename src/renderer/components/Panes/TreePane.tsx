import React from "react";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";
import { IDOM } from "Types";
import "./TreePane.scss";

interface TPProps {
  dom?: IDOM;
  onClickHandler: (lineNum: number) => void;
}

export default class TreePane extends React.Component<TPProps> {
  domToTreeItem(dom: IDOM): React.ReactNode {
    if (!dom) return null;
    return (
      <TreeItem
        key={dom.id}
        nodeId={dom.id.toString()}
        label={dom.name}
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
    return (
      <div className="tree-pane">
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {this.props.dom && this.domToTreeItem(this.props.dom)}
        </TreeView>
      </div>
    );
  }
}
