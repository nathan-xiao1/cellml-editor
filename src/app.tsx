import { hot } from "react-hot-loader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Editor from "./components/Editor";
import TitleMenuBar from "./components/misc/TitleMenuBar";

function App() {
  return (
    <React.Fragment>
      <TitleMenuBar />
      <Editor />
    </React.Fragment>
  );
}

const HotApp = hot(module)(App);

ReactDOM.render(<HotApp />, document.getElementById("root"));
