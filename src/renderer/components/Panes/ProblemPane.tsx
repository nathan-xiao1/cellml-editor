import React from "react";
import { IProblemItem } from "Types";
import "./ProblemPane.scss";

interface ProblemItemProps {
  type?: string;
  title?: string;
  description?: string;
}

function ProblemPaneItem(props: ProblemItemProps) {
  return (
    <div className={`problem-item ${props.type}-item`}>
      <div className="problem-item-description">
        <span className="problem-item-title">{props.title}: </span>
        {props.description}
      </div>
    </div>
  );
}

interface PPProps {
  problems: IProblemItem[];
}

export default class ProblemPane extends React.Component<PPProps> {
  render(): React.ReactNode {
    return (
      <div className="problem-container">
        {this.props.problems.map((problem, index) => (
          <ProblemPaneItem
            key={index}
            type={problem.severity}
            title={problem.title}
            description={problem.description}
          />
        ))}
      </div>
    );
  }
}
