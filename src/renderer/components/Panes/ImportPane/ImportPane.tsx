import React from "react";
import { ipcRenderer } from "electron";
import IPCChannel from "IPCChannels";
import { IComponent } from "Types";
import CellMLSchema, { IElement } from "src/commons/CellMLSchema";

import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";

import "./ImportPane.scss";

interface IPProps {
  filepath: string;
  xpath: string;
  openLibraryComponent: (componentId: string) => void;
}

interface IPState {
  components: IComponent[];
}

export default class ImportPane extends React.Component<IPProps, IPState> {
  constructor(props: IPProps) {
    super(props);
    this.state = {
      components: [],
    };

    // Listener to update the list of library components
    ipcRenderer.on(IPCChannel.RENDERER_UPDATE_COMPONENT, (_, components) => {
      this.setState({
        components: components,
      });
    });
  }

  async removeComponent(component: IComponent): Promise<void> {
    if (
      await ipcRenderer.invoke(
        IPCChannel.ACTION_CONFIRM,
        `Are you sure you want to delete component '${component.name}' from the library?`
      )
    ) {
      ipcRenderer.send(IPCChannel.LIBRARY_REMOVE_COMPONENT, component._id);
    }
  }

  async importComponent(component: IComponent): Promise<void> {
    if (!this.props.xpath) return;
    const xpaths = this.props.xpath?.split("/");
    const elementSchema = CellMLSchema.get(xpaths[xpaths.length - 1]);
    const isValid = elementSchema?.children.some((x) => x == component.rootTag);
    if (
      !isValid &&
      !(await ipcRenderer.invoke(
        IPCChannel.ACTION_CONFIRM,
        `Component '${component.rootTag}' is not a valid child of '${
          xpaths[xpaths.length - 1]
        }'.\nAre you sure you want to import this component?`
      ))
    ) {
      return;
    }
    ipcRenderer.send(
      IPCChannel.LIBRARY_IMPORT_TO_MODEL,
      this.props.filepath,
      this.props.xpath,
      component._id
    );
  }

  viewComponent(componentId: string): void {
    this.props.openLibraryComponent(componentId);
  }

  componentDidMount(): void {
    ipcRenderer.send(IPCChannel.LIBRARY_GET_COMPONENTS);
  }

  componentWillUnmount(): void {
    ipcRenderer.removeAllListeners(IPCChannel.RENDERER_UPDATE_COMPONENT);
  }

  render(): React.ReactNode {
    return (
      <div className="import-pane">
        <ul>
          {this.state.components.map((component) => {
            return (
              <li key={component._id}>
                <div className="import-component-item">
                  <div className="import-component-item-text">
                    <p
                      className="import-component-title"
                      onClick={() => this.viewComponent(component._id)}
                    >
                      {component.name}
                    </p>
                    <p className="import-component-subtitle">{component._id}</p>
                  </div>
                  <div className="import-component-item-action">
                    <div title="Delete Component from Library">
                      <DeleteIcon
                        className="remove-component-btn"
                        style={{ fontSize: 14, cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          this.removeComponent(component);
                        }}
                      />
                    </div>
                    <div title="Import Component">
                    <AddIcon
                      className="import-component-btn"
                      style={{ fontSize: 14, cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        this.importComponent(component);
                      }}
                    />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
