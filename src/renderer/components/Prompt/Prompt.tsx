import React, { Ref } from "react";
import CloseIcon from "@material-ui/icons/Close";

import "./Prompt.scss";

interface PProps {
  title: string;
  label: string;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

class Prompt extends React.Component<PProps> {
  private input: React.RefObject<HTMLInputElement>;

  constructor(props: PProps) {
    super(props);
    this.input = React.createRef();
  }

  submit(): void {
    this.props.onSubmit(this.input.current.value);
  }

  render(): React.ReactNode {
    return (
      <div className="prompt">
        <div className="prompt-body">
          <div className="prompt-toolbar">
            <p className="prompt-title">{this.props.title}</p>
            <CloseIcon
              className="prompt-close-btn"
              onClick={this.props.onClose}
            />
          </div>
          <div className="prompt-input-container">
            <p>{this.props.label}</p>
            <input ref={this.input}></input>
          </div>
          <div className="prompt-action-btns">
            <button className="prompt-btn" onClick={this.submit.bind(this)}>
              Ok
            </button>
            <button
              className="prompt-btn"
              onClick={this.props.onClose.bind(this)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Prompt;
