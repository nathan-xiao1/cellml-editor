import React from "react";
import IPCChannel from "IPCChannels";
import { ipcRenderer } from "electron";
import CloseIcon from "@material-ui/icons/Close";
import RemoveIcon from "@material-ui/icons/Remove";
import StopOutlinedIcon from "@material-ui/icons/StopOutlined";
import { MenuBar } from "react-electron-window-menu";

import "./TitleMenuBar.scss";

interface TMBProps {
  getActiveFilepath(): () => string;
}

export default class TitleMenuBar extends React.Component<TMBProps> {
  render(): React.ReactNode {
    return (
      <div className="title-menu-bar primary-text">
        <div id="menu-section" className="section">
          <MenuBar
            submenu={{
              style: { minWidth: "150px" },
              placement: "bottom",
            }}
            items={[
              {
                label: "File",
                submenu: [
                  {
                    label: "New File",
                    click: () => ipcRenderer.send(IPCChannel.NEW_FILE),
                    accelerator: "CmdOrCtrl+N",
                  },
                  {
                    label: "New from Template",
                    submenu: [
                      {
                        label: "Empty Model",
                        click: () =>
                          ipcRenderer.send(
                            IPCChannel.NEW_FROM_TEMPLATE,
                            "emptyModel"
                          ),
                      },
                    ],
                  },
                  { type: "separator" },
                  {
                    label: "Open File",
                    click: () => ipcRenderer.send(IPCChannel.OPEN_FILE),
                    accelerator: "CmdOrCtrl+O",
                  },
                  { type: "separator" },
                  {
                    label: "Save File",
                    click: () =>
                      ipcRenderer.send(
                        IPCChannel.SAVE_FILE,
                        this.props.getActiveFilepath()
                      ),
                    accelerator: "CmdOrCtrl+S",
                  },
                ],
              },
              {
                label: "Edit",
                submenu: [
                  {
                    label: "Undo",
                    click: () => console.log("TODO: Not Implemented"),
                    accelerator: "CmdOrCtrl+Z",
                  },
                  {
                    label: "Redo",
                    click: () => console.log("TODO: Not Implemented"),
                    accelerator: "CmdOrCtrl+Y",
                  },
                ],
              },
              {
                label: "View",
                submenu: [
                  {
                    label: "Toggle Developer Tools",
                    click: () =>
                      ipcRenderer.send(IPCChannel.TOGGLE_DEVELOPER_TOOLS),
                    accelerator: "CmdOrCtrl+Shift+I",
                  },
                  { type: "separator" },
                  {
                    label: "Debug",
                    click: () => ipcRenderer.send("debug"),
                  },
                ],
              },
              {
                label: "Help",
                submenu: [
                  {
                    label: "CellML 2.0 Specification",
                    click: () =>
                      ipcRenderer.send(IPCChannel.OPEN_CELLML_DOCUMENTATION),
                  },
                  {type: "separator"},
                  {
                    label: "Force Reload Window",
                    click: () => {
                      ipcRenderer.send(IPCChannel.FORCE_RELOAD_WINDOW)
                    }
                  }
                ],
              },
            ]}
          />
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
