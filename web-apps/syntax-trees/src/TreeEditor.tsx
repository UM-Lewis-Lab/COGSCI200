import { Component, createEffect, createSignal, For, Show } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { parse, SyntaxTree } from "./parser";
import styles from "./TreeEditor.module.css";

const TreeNode: Component<{ node: SyntaxTree }> = (props) => {
  const node = props.node;
  const isLeaf = node.children.length == 0;
  const xPad = 0;
  const yPad = 0.05;

  const adjustLayout = (layout: { x: number; y: number }) => {
    return {
      x: ((layout.x + xPad) / (1 + 2 * xPad)) * 100,
      y: ((layout.y + yPad) / (1 + 2 * yPad)) * 100,
    };
  };

  const layout = adjustLayout(node.layout);

  return (
    <>
      <text
        x={layout.x}
        y={layout.y}
        text-anchor="middle"
        classList={{
          [styles.syntaxTreeLabel as string]: true,
          [styles.categoryLabel as string]: !isLeaf,
          [styles.lexicalItemLabel as string]: isLeaf,
        }}
      >
        {node.label}
      </text>
      <For each={node.children}>
        {(c) => {
          const cLayout = adjustLayout(c.layout);
          let xOffset = 0;
          if (cLayout.x < layout.x) {
            xOffset = -1.5;
          } else if (cLayout.x > layout.x) {
            xOffset = 1.5;
          }
          return (
            <line
              x1={layout.x + xOffset}
              y1={layout.y + 2.5}
              x2={cLayout.x}
              y2={cLayout.y - 5.5}
              class={styles.syntaxTreeLink}
            />
          );
        }}
      </For>
    </>
  );
};

const TreeEditor: Component = () => {
  const openingDelimiter = "[";
  const closingDelimiter = "]";
  const defaultTreeSrc = `
    
[S 
  [NP
    [N Ash]
  ]
  [VP
    [V caught]
    [NP
      [det the]
      [NP
        [N mew]
        [PP
          [P with]
          [NP
            [det the]
            [NP 
              [N pokeball]
            ]
          ]
        ]
      ]
    ]
  ]
]

  `;
  const defaultTree = parse(defaultTreeSrc, openingDelimiter, closingDelimiter);
  const [src, setSrc] = createSignal(defaultTreeSrc);
  const [tree, setTree] = createSignal(defaultTree);
  const [sourceCodeError, setSourceCodeError] = createSignal("");

  const renderFragments = (tree: SyntaxTree) => {
    const isLeaf = tree.children.length == 0;
    return (
      <>
        <span class={styles.sourceNode}>
          <Show when={!isLeaf}>{openingDelimiter}</Show>
          <span
            class={
              tree.children.length == 0
                ? styles.lexicalItemLabel
                : styles.categoryLabel
            }
          >
            {tree.label}
          </span>
          <For each={tree.children}>{(c) => renderFragments(c)}</For>
          <Show when={!isLeaf}>{closingDelimiter} </Show>
        </span>
      </>
    );
  };

  const renderTree = (tree: SyntaxTree) => {
    return (
      <>
        <TreeNode node={tree} />
        <For each={tree.children}>{(c) => renderTree(c)}</For>
      </>
    );
  };

  createEffect(() => {
    try {
      const inputSrc = src();
      const t = parse(inputSrc, openingDelimiter, closingDelimiter);
      setTree(t);
      setSourceCodeError("");
    } catch (error) {
      setSourceCodeError((error as Error).message);
      // throw error;
    }
  });

  return (
    <div class={styles.syntaxTreeContainer}>
      <div class={styles.treeArea}>
        <Show
          when={!sourceCodeError()}
          fallback={
            <div class={styles.errorBox}>
              <p>{sourceCodeError()}</p>
            </div>
          }
        >
          <svg viewBox="0 0 100 100" class={styles.syntaxTree}>
            {renderTree(tree())}
            Sorry but this browser does not support inline SVG.
          </svg>
        </Show>
      </div>
      <div
        contentEditable={true}
        class={styles.syntaxTreeCodeArea}
        onInput={debounce(
          (event) => setSrc((event.target as HTMLDivElement).innerText),
          0
        )}
      >
        {renderFragments(tree())}
      </div>
    </div>
  );
};

export default TreeEditor;
