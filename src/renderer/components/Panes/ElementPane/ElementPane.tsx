import React from "react";
import { IDOM } from "Types";
import { getNodeFromXPath } from "src/commons/utils/xpath";
import CellMLSchema from "src/commons/CellMLSchema";
import "./ElementPane.scss";

interface EPProps {
  dom: IDOM;
  path: string;
}

interface CEIProps {
  childName: string;
}

interface CEIDProps {
  child: IDOM;
}

function ChildElementInfo(props: CEIProps): JSX.Element {
  return (
    <div className="child-element-info-container">
      <p className="child-element-info-header">
        <span>&lt;{props.childName}&gt;</span>
      </p>
      <p className="child-element-info-description">
        {CellMLSchema.get(props.childName)?.documentation.slice(0, 50) + "..."}
      </p>
    </div>
  );
}

function ChildElementInfoDOM(props: CEIDProps): JSX.Element {
  return (
    <div className="child-element-info-container">
      <p className="child-element-info-header">&lt;{props.child.name}&gt;</p>
      <p className="child-element-info-description">
        {props.child.altName ? props.child.altName : ""}
      </p>
    </div>
  );
}

export default class ElementPane extends React.Component<EPProps> {
  render(): React.ReactNode {
    const node = getNodeFromXPath(this.props.dom, this.props.path);
    if (!node) return null;
    return (
      <div className="element-container">
        <p className="element-header">Name</p>
        <p>&lt;{node.name}&gt;</p>

        <div className="element-divider"></div>

        <p className="element-header">XPath</p>
        <p>{this.props.path}</p>

        <div className="element-divider"></div>

        <p className="element-header">Current Child Element(s)</p>
        <div className="element-child-container">
          <ul>
            {node.children.map((child: IDOM, idx) => {
              return (
                <li key={idx}>
                  <ChildElementInfoDOM child={child} />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="element-divider"></div>

        <p className="element-header">Add Child Element</p>
        <div className="element-child-container">
          <ul>
            {CellMLSchema.get(node.name)?.children.map(
              (childName: string, idx) => {
                return (
                  <li key={idx}>
                    <ChildElementInfo childName={childName} />
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
