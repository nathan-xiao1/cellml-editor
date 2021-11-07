import React from "react";
import { IProblemItem, ProblemSeverity } from "Types";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import WarningIcon from "@material-ui/icons/ReportProblemOutlined";
import ErrorIcon from "@material-ui/icons/ErrorOutlineOutlined";
import "./ProblemPane.scss";

interface ProblemItemProps {
  type?: ProblemSeverity;
  title?: string;
  description?: string;
}

function ProblemPaneItem(props: ProblemItemProps) {
  let icon;
  switch (props.type) {
    case "hint":
    case "info":
      icon = <InfoIcon className="problem-icon problem-icon-info" />;
      break;
    case "warning":
      icon = <WarningIcon className="problem-icon problem-icon-warning" />;
      break;
    default:
      icon = <ErrorIcon className="problem-icon problem-icon-error" />;
      break;
  }
  return (
    <div className={`problem-item ${props.type}-item`}>
      <div className="problem-item-description">
        {props.title && (
          <span className="problem-item-title">{props.title}: </span>
        )}
        {icon}
        <span>{props.description}</span>
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
        {!this.props.problems && (
          <ProblemPaneItem key={0} type="info" description="No file loaded" />
        )}
        {this.props.problems && this.props.problems.length == 0 && (
          <ProblemPaneItem
            key={0}
            type="info"
            description="No problem detected"
          />
        )}
        {this.props.problems &&
          this.props.problems.map((problem, index) => {
            if (!problem.hidden)
              return (
                <ProblemPaneItem
                  key={index}
                  type={problem.severity}
                  title={problem.title}
                  description={problem.description}
                />
              );
          })}
      </div>
    );
  }
}
