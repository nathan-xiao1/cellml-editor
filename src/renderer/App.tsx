import { hot } from "react-hot-loader";
import * as React from "react";
import * as ReactDOM from "react-dom";
import Editor from "./components/Editor";
import runServer from "./components/EquationViewer/WebServer";



function App() {
  runServer();
  return <Editor />;
}

const HotApp = hot(module)(App);

ReactDOM.render(<HotApp />, document.getElementById("root"));
