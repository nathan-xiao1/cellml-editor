import { hot } from 'react-hot-loader';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

function App() {
  return <h2>Hello from React!</h2>
}

const HotApp = hot(module)(App);

ReactDOM.render(<HotApp />, document.getElementById('root'));