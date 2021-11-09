import React from "react";
import Mousetrap from "mousetrap";
import IPCChannel from "IPCChannels";
import { ipcRenderer, webFrame } from "electron";
import CloseIcon from "@material-ui/icons/Close";
import RemoveIcon from "@material-ui/icons/Remove";
import StopOutlinedIcon from "@material-ui/icons/StopOutlined";
import { MenuBar } from "react-electron-window-menu";

import "./TitleMenuBar.scss";

interface TMBProps {
  saveBtnEnabled: boolean;
  getActiveFilepath: () => string;
  formatDocument: () => void;
  openPrompt: () => void;
}

interface TMBState {
  persistentStateEnabled: boolean;
}

export default class TitleMenuBar extends React.Component<TMBProps, TMBState> {
  constructor(props: TMBProps) {
    super(props);
    this.state = { persistentStateEnabled: true };
  }

  componentDidMount(): void {
    // Register hortcut keys
    Mousetrap.bind("mod+s", this.saveFile);
    Mousetrap.bind("mod+o", this.openFile);
    Mousetrap.bind("mod+n", this.newFile);
    Mousetrap.bind("mod+=", this.zoomIn);
    Mousetrap.bind("mod+-", this.zoomOut);
    Mousetrap.bind("mod+shift+r", this.forceReloadWindow);
    ipcRenderer
      .invoke(IPCChannel.GET_SETTING, "persistentStateEnabled")
      .then((res) => {
        this.setState({
          persistentStateEnabled: res,
        });
      });
  }

  componentWillUnmount(): void {
    Mousetrap.unbind("mod+s");
    Mousetrap.unbind("mod+o");
    Mousetrap.unbind("mod+n");
    Mousetrap.unbind("mod+=");
    Mousetrap.unbind("mod+-");
    Mousetrap.unbind("mod+shift+r");
  }

  newFile(): void {
    ipcRenderer.send(IPCChannel.NEW_FILE);
  }

  openGraphicalEditor(): void {
    ipcRenderer.send(IPCChannel.NEW_FILE_GRAPHICAL);
  }

  newFileFromTemplate(id: string): void {
    ipcRenderer.send(IPCChannel.NEW_FROM_TEMPLATE, id);
  }

  openFile(): void {
    ipcRenderer.send(IPCChannel.OPEN_FILE);
  }

  saveFile(): void {
    const activeFilepath = this.props.getActiveFilepath();
    if (activeFilepath) {
      ipcRenderer.send(IPCChannel.SAVE_FILE, activeFilepath);
    }
  }

  forceReloadWindow(): void {
    ipcRenderer.send(IPCChannel.FORCE_RELOAD_WINDOW);
  }

  zoomIn(): void {
    webFrame.setZoomFactor(webFrame.getZoomFactor() + 0.2);
  }

  zoomOut(): void {
    webFrame.setZoomFactor(webFrame.getZoomFactor() - 0.2);
  }

  toggleEnablePersistentState(): void {
    ipcRenderer
      .invoke(IPCChannel.TOGGLE_SETTING, "persistentStateEnabled")
      .then((res) => {
        this.setState({
          persistentStateEnabled: res,
        });
      });
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
                    click: this.newFile.bind(this),
                    accelerator: "CmdOrCtrl+N",
                  },
                  {
                    label: "New from Template",
                    submenu: [
                      {
                        label: "Empty Model",
                        click: () => this.newFileFromTemplate("emptyModel"),
                      },
                      {
                        label: "Sample Model",
                        click: () => this.newFileFromTemplate("sampleModel"),
                      },
                    ],
                  },
                  { type: "separator" },
                  {
                    label: "Open Graphical Editor",
                    click: this.openGraphicalEditor.bind(this),
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
                    click: this.saveFile.bind(this),
                    accelerator: "CmdOrCtrl+S",
                    enabled: this.props.saveBtnEnabled,
                  },
                  { type: "separator" },
                  {
                    label: "Persistent State",
                    accelerator: this.state.persistentStateEnabled
                      ? "Enabled"
                      : "Disabled",
                    click: this.toggleEnablePersistentState.bind(this),
                  },
                ],
              },
              {
                label: "Edit",
                submenu: [
                  {
                    label: "Zoom In",
                    click: this.zoomIn,
                    accelerator: "CmdOrCtrl+=",
                  },
                  {
                    label: "Zoom Out",
                    click: this.zoomOut,
                    accelerator: "CmdOrCtrl+-",
                  },
                  { type: "separator" },
                  {
                    label: "Format Model",
                    click: this.props.formatDocument,
                    accelerator: "Alt+Shift+R",
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
                    label: "Help & Documentation",
                    click: () =>
                      ipcRenderer.send(IPCChannel.OPEN_DOCUMENTATION),
                  },
                  { type: "separator" },
                  {
                    label: "Report a Bug or Submit Feedback",
                    click: () =>
                      ipcRenderer.send(IPCChannel.OPEN_REPORT_DIALOG),
                  },
                  { type: "separator" },
                  {
                    label: "Force Reload Window",
                    click: this.forceReloadWindow,
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
