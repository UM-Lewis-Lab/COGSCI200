import type { Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";
import TreeEditor from "./TreeEditor";

const App: Component = () => {
  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <TreeEditor />
      </header>
    </div>
  );
};

export default App;
