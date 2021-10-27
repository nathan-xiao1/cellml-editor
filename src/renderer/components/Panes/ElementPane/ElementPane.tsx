import React from "react";
import { IDOM } from "Types";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import CellMLSchema from "src/commons/CellMLSchema";
import "./ElementPane.scss";

interface EPProps {
  node: IDOM;
  path: string;
  addChildHandler: (childName: string) => void;
  removeChildHandler: (idx: number) => void;
}

export default class ElementPane extends React.Component<EPProps> {
  render(): React.ReactNode {
    if (!this.props.node) return null;
    return (
      <div className="element-container">
        <p className="element-header">Name</p>
        <p>&lt;{this.props.node.name}&gt;</p>

        <div className="element-divider"></div>

        <p className="element-header">XPath</p>
        <p>{this.props.path}</p>

        <div className="element-divider"></div>

        <p className="element-header">Current Child Element(s)</p>
        <div className="element-child-container">
          <ul>
            {this.props.node.children.map((child: IDOM, idx) => {
              return (
                <li key={idx}>
                  <div className="child-element-info-container">
                    <div className="child-element-info-header">
                      <p>&lt;{child.name}&gt;</p>
                      <div title="Remove Child Element">
                        <DeleteIcon
                          style={{ fontSize: 14, cursor: "pointer" }}
                          onClick={() => this.props.removeChildHandler(idx)}
                        />
                      </div>
                    </div>
                    <p className="child-element-info-description">
                      {child.altName ? child.altName : ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="element-divider"></div>
        <p className="element-header">Add Child Element</p>
        <div className="element-child-container">
          <ul>
            {CellMLSchema.get(this.props.node.name)?.children.map(
              (childName: string, idx) => {
                return (
                  <li key={idx}>
                    <div className="child-element-info-container">
                      <div className="child-element-info-header">
                        <p>&lt;{childName}&gt;</p>
                        <div title="Add Child Element">
                        <AddIcon
                          style={{ fontSize: 14, cursor: "pointer" }}
                          onClick={() => this.props.addChildHandler(childName)}
                        />
                        </div>
                      </div>
                      <p className="child-element-info-description">
                        {CellMLSchema.get(childName)?.documentation
                          ? CellMLSchema.get(childName).documentation.slice(
                              0,
                              50
                            ) + "..."
                          : ""}
                      </p>
                    </div>
                  </li>
                );
              }
            )}
          </ul>
        </div>
      </div>
    );
  }
}
