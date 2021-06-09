import React from "react";
import PaneHeader from "./PaneHeader";
import "./Pane.scss";

interface PaneProps {
  title: string;
  collapsible: boolean;
  noOverflow: boolean;
}

export default class Pane extends React.Component<PaneProps> {
  static defaultProps = {
    collapsible: true,
    noOverflow: false,
  };

  render(): React.ReactNode {
    return (
      <div className="pane">
        <PaneHeader
          title={this.props.title ? this.props.title : "name not set"}
          collapsible={this.props.collapsible}
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
