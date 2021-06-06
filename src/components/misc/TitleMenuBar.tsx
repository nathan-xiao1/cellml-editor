import { ipcRenderer } from "electron";
import React from "react";
import "./TitleMenuBar.scss";

export default class TitleMenuBar extends React.Component {
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
              <div>Open File</div>
              <div>Save</div>
            </div>
          </div>
          <div className="menu-item">Edit</div>
          <div className="menu-item">View</div>
          <div
            className="menu-item"
            onClick={() => this.ipcSend("toggle-developer-tools")}>
            Toggle Developer Tools
          </div>
        </div>

        <div id="title-section" className="section">
          CellML Editor
        </div>

        <div id="window-btn-section" className="section">
          <div id="minimise-btn" className="window-btn">
            -
          </div>
          <div id="expand-btn" className="window-btn">
            o
          </div>
          <div id="close-btn" className="window-btn">
            x
          </div>
        </div>
      </div>
    );
  }
}
