import React, { useState } from "react";
import CodeIcon from "@material-ui/icons/Code";
import ViewCompactIcon from "@material-ui/icons/ViewCompact";
import { ViewMode } from "Types";
import "./EditorToggle.scss";

interface ETProps {
  toggleViewMode: (mode: ViewMode) => void;
}

export default function EditorToggle(props: ETProps): JSX.Element {
  const [mode, setMode] = useState<ViewMode>("text");

  const _toggleViewMode = (viewMode: ViewMode): void => {
    setMode(viewMode);
    props.toggleViewMode(viewMode);
  };

  return (
    <div className="view-toggle-container">
      <button
        className={`view-toggle-button ${mode == "text" ? "active" : ""}`}
        title="Text Mode"
        onClick={() => _toggleViewMode("text")}
      >
        <CodeIcon className="view-toggle-icon" fontSize="small" />
      </button>
      <div className="view-toggle-divider"></div>
      <button
        className={`view-toggle-button ${mode == "graphical" ? "active" : ""}`}
        title="Graphical Mode"
        onClick={() => _toggleViewMode("graphical")}
      >
        <ViewCompactIcon className="view-toggle-icon" fontSize="small" />
      </button>
    </div>
  );
}
// canvas layers widgets formaat-shapes
