import { Component, createEffect, createSignal, For } from "solid-js";
import { parse, SyntaxTree } from "./parser";
import styles from "./TreeEditor.module.css";

const TreeNode: Component<{ node: SyntaxTree }> = (props) => {
  const node = props.node;
  const xPad = 0;
  const yPad = 0.05;

  const x = ((node.layout.x + xPad) / (1 + 2 * xPad)) * 100;
  const y = ((node.layout.y + yPad) / (1 + 2 * yPad)) * 100;
  return (
    <text x={x} y={y} text-anchor="middle" class={styles.syntaxTreeLabel}>
      {node.label}
    </text>
  );
};

const TreeEditor: Component = () => {
  const openingDelimiter = "[";
  const closingDelimiter = "]";
  const defaultTree = "[S [NP [det The] [N cat]] [VP [V meowed]]]";
  const [src, setSrc] = createSignal(defaultTree);
  const [nodes, setNodes] = createSignal(Array<SyntaxTree>());

  const flattenTree = (
    tree: SyntaxTree,
    result: SyntaxTree[] = []
  ): SyntaxTree[] => {
    result.push(tree);
    tree.children.forEach((t) => flattenTree(t, result));
    return result;
  };

  createEffect(() => {
    const tree = parse(src(), openingDelimiter, closingDelimiter);
    setNodes(flattenTree(tree));
  });

  return (
    <div class={styles.syntaxTreeContainer}>
      <svg viewBox="0 0 100 100" class={styles.syntaxTree}>
        <For each={nodes()}>{(n) => <TreeNode node={n} />}</For>
        Sorry but this browser does not support inline SVG.
      </svg>
    </div>
  );
};

export default TreeEditor;
