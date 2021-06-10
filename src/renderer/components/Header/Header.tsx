import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import "./Header.scss";
import { ipcRenderer } from "electron";

function filePathToName(filepath: string) {
  return filepath.split("\\").pop();
}

/* HeaderTab Class */
interface TabProps {
  title: string;
  active: boolean;
  onTabClick: (file: string) => void;
  onCloseClick: () => void;
}

function Tab(props: TabProps): JSX.Element {
  return (
    <div
      className={`header-tab ${props.active ? "active" : ""}`}
      onClick={() => props.onTabClick(props.title)}>
      <div className="header-tab-title" title={props.title}>
        {filePathToName(props.title)}
      </div>
      <CloseIcon
        className="tab-close-btn"
        style={{ fontSize: 14 }}
        onClick={() => {
          props.onCloseClick();
        }}
      />
    </div>
  );
}

Tab.defaultProps = { active: false };

/* Header Class */
interface HeaderState {
  openedFile: string[];
  activeIndex: number;
}

export default class Header extends React.Component<unknown, HeaderState> {
  constructor(props: unknown) {
    super(props);
    this.state = { openedFile: [], activeIndex: -1 };
    ipcRenderer.on("update-opened-file", (_, arg) => {
      this.setState((prevState) => {
        return {
          openedFile: arg,
          activeIndex: arg.length - 1,
        };
      });
    });
    ipcRenderer.send("get-opened-file");
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners("update-opened-file");
  }

  setActiveFile(file: string): void {
    const index: number = this.state.openedFile.indexOf(file);
    this.setState({ activeIndex: index });
  }

  render(): React.ReactNode {
    return (
      <div className="header-tab-container">
        {this.state.openedFile.map((file, index) => (
          <Tab
            title={file}
            key={index}
            active={this.state.activeIndex == index ? true : false}
            onTabClick={this.setActiveFile.bind(this)}
            onCloseClick={() => ipcRenderer.send("close-file", file)}
          />
        ))}
      </div>
    );
  }
}
