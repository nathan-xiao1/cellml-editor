import React from "react";
import { IDOM } from "Types";
import CellMLSchema from "src/commons/CellMLSchema";

interface EPProps {
	node: IDOM;
	path: string;
	addChildHandler?: (childName: string) => void;
	removeChildHandler?: (idx: number) => void;
}

export default class EquationPane extends React.Component<EPProps> {
	render(): React.ReactNode {
		if (!this.props.node) return null;
		return (
      <>
        {this.props.node.name}
      </>
		);
	}
}