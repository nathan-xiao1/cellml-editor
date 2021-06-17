import { ipcRenderer } from "electron";
import CloseIcon from "@material-ui/icons/Close";
import RemoveIcon from "@material-ui/icons/Remove";
import StopOutlinedIcon from "@material-ui/icons/StopOutlined";
import React from "react";
import "./TitleMenuBar.scss";

interface TMBProps {
  getActiveFilepath(): () => string;
}

export default class TitleMenuBar extends React.Component<TMBProps> {
  ipcSend(action: string): void {
    ipcRenderer.send(action);
  }

  render(): React.ReactNode {
    return (
      <div className="title-menu-bar primary-text">
        <div id="menu-section" className="section">
          <div className="menu-item">
            File
            <div className="dropdown-content">
              <div onClick={() => this.ipcSend("open-file")}>Open File</div>
              <div onClick={() => ipcRenderer.send('save-file', this.props.getActiveFilepath())}>Save</div>
            </div>
          </div>
          <div className="menu-item">Edit</div>
          <div className="menu-item">View</div>
          <div
            className="menu-item"
            onClick={() => this.ipcSend("toggle-developer-tools")}>
            Toggle Developer Tools
          </div>
          <div className="menu-item" onClick={() => this.ipcSend("debug")}>
            Debug
          </div>
        </div>

        <div id="title-section" className="section">
          CellML Editor
        </div>

        <div id="window-btn-section" className="section">
          <div
            id="minimise-btn"
            className="window-btn"
            onClick={() => this.ipcSend("minimise-window")}>
            <RemoveIcon style={{ fontSize: 18 }} />
          </div>
          <div
            id="expand-btn"
            className="window-btn"
            onClick={() => this.ipcSend("expand-window")}>
            <StopOutlinedIcon style={{ fontSize: 18 }} />
          </div>
          <div
            id="close-btn"
            className="window-btn"
            onClick={() => this.ipcSend("close-window")}>
            <CloseIcon style={{ fontSize: 18 }} />
          </div>
        </div>
      </div>
    );
  }
}
