import { Component, createEffect, createSignal, For } from "solid-js";
import { parse, SyntaxTree } from "./parser";
import styles from "./TreeEditor.module.css";

type SyntaxTreeNode = {
  label: string;
  x: number;
  y: number;
};

const TreeNode: Component<{ node: SyntaxTreeNode }> = (props) => {
  const node = props.node;
  const xPad = 0;
  const yPad = 0.05;

  const x = ((node.x + xPad) / (1 + 2 * xPad)) * 100;
  const y = ((node.y + yPad) / (1 + 2 * yPad)) * 100;
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
  const [nodes, setNodes] = createSignal(Array<SyntaxTreeNode>());

  const createNodes = (
    tree: SyntaxTree,
    rootWidth: number,
    maxDepth: number,
    result: SyntaxTreeNode[] = [],
    depth: number = 0,
    rootXUnscaled: number = 0
  ) => {
    // Calculate the X coordinate for this node
    const subTreeWidths = tree.subTreeWidths;
    const offset = subTreeWidths.reduce((a, b) => a + b, 0) / 2;
    const nodeXUnscaled = rootXUnscaled + offset;
    console.log(tree.label, rootXUnscaled, offset, tree.subTreeWidths);

    // Create the node
    const node = {
      label: tree.label,
      x: nodeXUnscaled / rootWidth,
      y: depth / maxDepth,
    };
    result.push(node);

    // Create nodes for children
    tree.children.forEach((t, i) => {
      let x: number;
      if (i / tree.children.length < 0.5) {
        x = rootXUnscaled;
      } else {
        x = nodeXUnscaled;
      }
      createNodes(t, rootWidth, maxDepth, result, depth + 1, x);
    });
    return result;
  };
  createEffect(() => {
    const [tree, maxDepth] = parse(src(), openingDelimiter, closingDelimiter);
    setNodes(
      createNodes(
        tree,
        (tree.subTreeWidths || [0]).reduce((a, b) => a + b, 0),
        maxDepth
      )
    );
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
