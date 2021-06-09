import React from "react";
import PaneHeader from "./misc/PaneHeader";
import "./ProblemPane.scss";
import Pane from "./misc/Pane";

interface ProblemItemProps {
  type?: string;
  title?: string;
  description?: string;
}

function ProblemItem(props: ProblemItemProps) {
  return (
    <div
      className={`problem-item ${props.type}-item`}>
      <div className="problem-item-description">
        <span className="problem-item-title">Invalid character: </span>Some
        description about the problem
      </div>
    </div>
  );
}

export default class ProblemPane extends React.Component {
  render(): React.ReactNode {
    return (
      <Pane title="Problem">
        <div className="problem-container">
          <ProblemItem type="warning" />
          <ProblemItem type="error" />
          <ProblemItem type="error" />
          <ProblemItem type="warning" />
          <ProblemItem type="error" />
          <ProblemItem type="error" />
          <ProblemItem type="error" />
          <ProblemItem type="error" />
          <ProblemItem type="error" />
        </div>
      </Pane>
    );
  }
}
