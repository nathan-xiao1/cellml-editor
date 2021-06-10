import React from "react";
import { ReflexContainer, ReflexSplitter, ReflexElement } from "react-reflex";
import "react-reflex/styles.css";
import "./Editor.scss";
import ProblemPane from "./Panes/ProblemPane";

export default class Editor extends React.Component {
  render(): React.ReactNode {
    return (
      <div className="editor-container primary-bg primary-text">
        <ReflexContainer orientation="vertical" windowResizeAware={true}>
          <ReflexElement className="pane-left" minSize={150} flex={0.15}>
            Left
          </ReflexElement>
          <ReflexSplitter className="primary-splitter splitter" />
          <ReflexElement className="pane-middle">
            <ReflexContainer orientation="horizontal">
              <ReflexElement className="pane-middle-header" size={35}>
                Header
              </ReflexElement>
              <ReflexElement className="pane-middle-top primary-bg-dark">
                Middle Top
              </ReflexElement>
              <ReflexSplitter className="primary-splitter splitter" />
              <ReflexElement
                className="pane-middle-bottom"
                minSize={50}
                flex={0.25}>
                <ProblemPane />
              </ReflexElement>
            </ReflexContainer>
          </ReflexElement>
          <ReflexSplitter className="primary-splitter splitter" />
          <ReflexElement className="pane-right" minSize={150} flex={0.15}>
            Right
          </ReflexElement>
        </ReflexContainer>
      </div>
    );
  }
}
