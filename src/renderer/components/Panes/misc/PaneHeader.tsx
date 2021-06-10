import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import "./PaneHeader.scss";

interface PaneHeaderProps {
  title: string;
  collapsible?: boolean;
  extraButton?: JSX.Element;
}

PaneHeader.defaultProps = {
  collapsible: true,
};

export default function PaneHeader(props: PaneHeaderProps): JSX.Element {
  return (
    <div className="pane-header">
      <div className="pane-content-left">
        {props.collapsible && (
          <ExpandMoreIcon className="pane-header-expand-btn" fontSize="small" />
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
