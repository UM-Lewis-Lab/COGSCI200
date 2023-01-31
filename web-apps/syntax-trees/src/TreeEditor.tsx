import { Component, createEffect, createSignal, For } from "solid-js";
import { parse, SyntaxTree } from "./parser";
import styles from "./TreeEditor.module.css";

const TreeNode: Component<{ node: SyntaxTree }> = (props) => {
  const node = props.node;
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
          [styles.lexicalItemLabel as string]: node.children.length == 0,
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
  const defaultTree = `
    
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
