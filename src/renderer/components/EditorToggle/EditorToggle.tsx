import React from "react";
import ViewArrayOutlinedIcon from '@material-ui/icons/ViewArrayOutlined';
import "./EditorToggle.scss";

interface ETProps {
  onToggle?: () => void;
}

export default function EditorToggle(props: ETProps): JSX.Element {
  return (
    <button className="view-toggle-button" onClick={props.onToggle}>
      <ViewArrayOutlinedIcon className="view-toggle-icon" fontSize="small" />
      <p className="view-toggle-text">Toggle View</p>
    </button>
  );
}
