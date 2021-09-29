import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import "./Header.scss";
import EditorToggle from "../EditorToggle/EditorToggle";
import { ViewMode } from "Types";

function filePathToName(filepath: string) {
  return filepath.split('\\').pop().split('/').pop();
}

/* HeaderTab Class */
interface TabProps {
  title: string;
  active: boolean;
  readonly: boolean;
  onTabClick: (file: string) => void;
  onTabClose: (file: string) => void;
}

function Tab(props: TabProps): JSX.Element {
  return (
    <div className={`header-tab ${props.active ? "active" : ""}`}>
      <div
        className="header-tab-title"
        title={props.title}
        onClick={() => props.onTabClick(props.title)}
      >
        {filePathToName(props.title)}{props.readonly && " (Read-only)"}
      </div>
      <CloseIcon
        className="tab-close-btn"
        style={{ fontSize: 14 }}
        onClick={() => {
          props.onTabClose(props.title);
        }}
      />
    </div>
  );
}

Tab.defaultProps = { active: false };

/* Header Class */
interface HeaderProp {
  openedFiles: string[];
  activeFileIndex: number;
  activeFileReadonly: boolean;
  showToggle: boolean;
  onTabClick: (file: string) => void;
  onTabClose: (file: string) => void;
  toggleViewMode: (mode: ViewMode) => void;
}

export default function Header(props: HeaderProp): JSX.Element {
  return (
    <div className="header-container">
      <div className="header-tab-container">
        {props.openedFiles.map((file, index) => (
          <Tab
            title={file}
            key={index}
            readonly={props.activeFileReadonly}
            active={props.activeFileIndex == index ? true : false}
            onTabClick={props.onTabClick}
            onTabClose={props.onTabClose}
          />
        ))}
      </div>
      {props.showToggle && (
        <div className="header-control-container">
          <EditorToggle toggleViewMode={props.toggleViewMode} />
        </div>
      )}
    </div>
  );
}
