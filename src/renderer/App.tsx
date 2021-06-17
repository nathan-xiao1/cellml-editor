import { hot } from "react-hot-loader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Editor from "./components/Editor";

function App() {
  return <Editor />;
}

const HotApp = hot(module)(App);

ReactDOM.render(<HotApp />, document.getElementById("root"));
