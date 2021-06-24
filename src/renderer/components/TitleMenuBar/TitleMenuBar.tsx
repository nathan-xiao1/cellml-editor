import React from "react";
import IPCChannel from "IPCChannels";
import { ipcRenderer } from "electron";
import CloseIcon from "@material-ui/icons/Close";
import RemoveIcon from "@material-ui/icons/Remove";
import StopOutlinedIcon from "@material-ui/icons/StopOutlined";

import "./TitleMenuBar.scss";

interface TMBProps {
  getActiveFilepath(): () => string;
}

export default class TitleMenuBar extends React.Component<TMBProps> {
  render(): React.ReactNode {
    return (
      <div className="title-menu-bar primary-text">
        <div id="menu-section" className="section">
          <div className="menu-item">
            File
            <div className="dropdown-content">
              <div onClick={() => ipcRenderer.send(IPCChannel.NEW_FILE)}>
                New File
              </div>
              <div onClick={() => ipcRenderer.send(IPCChannel.OPEN_FILE)}>
                Open File
              </div>
              <div
                onClick={() =>
                  ipcRenderer.send(
                    IPCChannel.SAVE_FILE,
                    this.props.getActiveFilepath()
                  )
                }>
                Save
              </div>
            </div>
          </div>
          <div className="menu-item">Edit</div>
          <div className="menu-item">View</div>
          <div
            className="menu-item"
            onClick={() => ipcRenderer.send(IPCChannel.TOGGLE_DEVELOPER_TOOLS)}>
            Toggle Developer Tools
          </div>
          <div className="menu-item" onClick={() => ipcRenderer.send("debug")}>
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
            onClick={() => ipcRenderer.send(IPCChannel.MINIMISE_WINDOW)}>
            <RemoveIcon style={{ fontSize: 18 }} />
          </div>
          <div
            id="expand-btn"
            className="window-btn"
            onClick={() => ipcRenderer.send(IPCChannel.EXPAND_WINDOW)}>
            <StopOutlinedIcon style={{ fontSize: 18 }} />
          </div>
          <div
            id="close-btn"
            className="window-btn"
            onClick={() => ipcRenderer.send(IPCChannel.CLOSE_WINDOW)}>
            <CloseIcon style={{ fontSize: 18 }} />
          </div>
        </div>
      </div>
    );
  }
}
