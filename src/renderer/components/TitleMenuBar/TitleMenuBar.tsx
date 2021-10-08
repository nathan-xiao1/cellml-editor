import React from "react";
import Mousetrap from "mousetrap";
import IPCChannel from "IPCChannels";
import { ipcRenderer } from "electron";
import CloseIcon from "@material-ui/icons/Close";
import RemoveIcon from "@material-ui/icons/Remove";
import StopOutlinedIcon from "@material-ui/icons/StopOutlined";
import { MenuBar } from "react-electron-window-menu";

import "./TitleMenuBar.scss";

interface TMBProps {
  redoHandler: () => void;
  undoHandler: () => void;
  getActiveFilepath: () => string;
  openPrompt: () => void;
}

export default class TitleMenuBar extends React.Component<TMBProps> {
  componentDidMount(): void {
    // Register hortcut keys
    Mousetrap.bind("mod+s", this.saveFile);
    Mousetrap.bind("mod+o", this.openFile);
    Mousetrap.bind("mod+n", this.newFile);
  }

  newFile(): void {
    ipcRenderer.send(IPCChannel.NEW_FILE);
  }

  newFileFromTemplate(id: string): void {
    ipcRenderer.send(IPCChannel.NEW_FROM_TEMPLATE, id);
  }

  openFile(): void {
    ipcRenderer.send(IPCChannel.OPEN_FILE);
  }

  saveFile(): void {
    ipcRenderer.send(IPCChannel.SAVE_FILE, this.props.getActiveFilepath());
  }

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
                    click: this.newFile,
                    accelerator: "CmdOrCtrl+N",
                  },
                  {
                    label: "New from Template",
                    submenu: [
                      {
                        label: "Empty Model",
                        click: () => this.newFileFromTemplate("emptyModel"),
                      },
                    ],
                  },
                  { type: "separator" },
                  {
                    label: "Open File",
                    click: this.openFile,
                    accelerator: "CmdOrCtrl+O",
                  },
                  {
                    label: "Open from URL",
                    click: () => {
                      this.props.openPrompt();
                    },
                  },
                  { type: "separator" },
                  {
                    label: "Save File",
                    click: this.saveFile,
                    accelerator: "CmdOrCtrl+S",
                  },
                ],
              },
              {
                label: "Edit",
                submenu: [
                  {
                    label: "Undo",
                    click: this.props.undoHandler,
                    accelerator: "CmdOrCtrl+Z",
                  },
                  {
                    label: "Redo",
                    click: this.props.redoHandler,
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
                  { type: "separator" },
                  {
                    label: "Force Reload Window",
                    click: () => {
                      ipcRenderer.send(IPCChannel.FORCE_RELOAD_WINDOW);
                    },
                  },
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
            onClick={() => ipcRenderer.send(IPCChannel.MINIMISE_WINDOW)}
          >
            <RemoveIcon style={{ fontSize: 18 }} />
          </div>
          <div
            id="expand-btn"
            className="window-btn"
            onClick={() => ipcRenderer.send(IPCChannel.EXPAND_WINDOW)}
          >
            <StopOutlinedIcon style={{ fontSize: 18 }} />
          </div>
          <div
            id="close-btn"
            className="window-btn"
            onClick={() => ipcRenderer.send(IPCChannel.CLOSE_WINDOW)}
          >
            <CloseIcon style={{ fontSize: 18 }} />
          </div>
        </div>
      </div>
    );
  }
}
