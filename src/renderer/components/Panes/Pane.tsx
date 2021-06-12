import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import "./Pane.scss";

/*
Pane Header Class
*/
interface PaneHeaderProps {
  title: string;
  collapsible?: boolean;
  extraButton?: JSX.Element;
  onCollapseClick: () => void;
}

PaneHeader.defaultProps = {
  collapsible: true,
  onCollapseClick: () => {
    console.log("Not implemented");
  },
};

function PaneHeader(props: PaneHeaderProps): JSX.Element {
  const collapse = () => {
    props.onCollapseClick();
  };

  return (
    <div className="pane-header">
      <div className="pane-content-left">
        {props.collapsible && (
          <ExpandMoreIcon
            className="pane-header-expand-btn"
            fontSize="small"
            onClick={() => collapse()}
          />
        )}
        <h4
          className={`pane-header-title  ${
            props.collapsible ? "" : "no-icon"
          }`}>
          {props.title}
        </h4>
      </div>
      <div className="pane-content-right">{props.extraButton}</div>
    </div>
  );
}

/*
Pane Class
*/
interface PaneProps {
  title: string;
  collapsible: boolean;
  noOverflow: boolean;
  onCollapseClick: () => void;
}

export default class Pane extends React.Component<PaneProps> {
  static defaultProps = {
    collapsible: true,
    noOverflow: false,
    onCollapseClick: (): void => {
      console.log("Not implemented");
    },
  };

  render(): React.ReactNode {
    return (
      <div className="pane">
        <PaneHeader
          title={this.props.title ? this.props.title : "name not set"}
          collapsible={this.props.collapsible}
          onCollapseClick={this.props.onCollapseClick}
        />
        <div
          className={`pane-content ${
            this.props.noOverflow ? "no-overflow" : ""
          }`}>
          {this.props.children}
          <div className="scrollbar-fade"></div>
        </div>
      </div>
    );
  }
}
