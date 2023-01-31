export type SyntaxTree = {
  label: string;
  children: SyntaxTree[];
  leftSubtreeWidth: number;
  rightSubtreeWidth: number;
  layout: { x: number; y: number };
};

type StopIndex = number;

const preprocess = (
  src: string,
  openingDelimiter: string,
  closingDelimiter: string
): string[] => {
  const chars = [...src];
  let depth = 0;
  let start: number = 0;
  let end: number = chars.length;
  chars.forEach((c, i) => {
    if (c == openingDelimiter) {
      if (depth == 0) {
        start = i;
      }
      depth++;
    } else if (c == closingDelimiter) {
      depth--;
      if (depth == 0) {
        end = i;
      }
    } else if (c.match(/[^\s]/) && depth == 0) {
      throw Error("Cannot have a lexical item outside of the tree");
    }
  });
  if (depth < 0) {
    throw Error(`${-depth} extra ${closingDelimiter}`);
  } else if (depth > 0) {
    throw Error(`${depth} extra ${openingDelimiter}`);
  }
  // Trim off the start and end delimiters
  return chars.slice(start + 1, end);
};

type IntermediateParse = {
  label: string;
  children: IntermediateParse[];
  leftSubtreeWidth?: number;
  rightSubtreeWidth?: number;
  layout?: { x: number; y: number };
};

const _parse = (
  input: string[],
  openingDelimiter: string,
  closingDelimiter: string
): [IntermediateParse, StopIndex] => {
  let label = "";
  let children: IntermediateParse[] = [];
  let labelStart = 0;
  let i = 0;

  // Find the label
  while (i < input.length) {
    const c = input[i];
    if (c == openingDelimiter || c == closingDelimiter || c?.match(/\s/)) {
      label = input.slice(labelStart, i).join("").trim();
      i++;
      break;
    }
    i++;
  }
  if (!label) {
    console.log(input);
    throw Error("This node needs a label");
  }

  // Find children
  let lexicalItemStart = 0;
  while (i < input.length) {
    const c = input[i];
    if (c == openingDelimiter) {
      // Nested subtree
      let [child, stopIndex] = _parse(
        input.slice(i + 1),
        openingDelimiter,
        closingDelimiter
      );
      i += stopIndex;
      children.push(child);
    } else if (c == closingDelimiter) {
      // End of current subtree
      i++;
      break;
    } else if (c?.match(/[^\s]/)) {
      if (!lexicalItemStart) {
        lexicalItemStart = i;
      }
    }
    i++;
  }
  if (lexicalItemStart) {
    if (children.length > 0) {
      throw Error("A lexical item must be the only child of its parent node");
    }
    // The lexical item ends at i - 1 because i includes the closing delimiter
    const lexicalItemLabel = input
      .slice(lexicalItemStart, i - 1)
      .join("")
      .trim();
    if (lexicalItemLabel.match(/\s/)) {
      throw Error("You can only have one lexical item (one word) per node.");
    }
    // Lexical item ended
    children.push({
      label: lexicalItemLabel,
      children: [],
    });
  }
  return [{ label: label, children: children }, i];
};

const getStats = (
  tree: IntermediateParse,
  depth: number = 0
): [number, number] => {
  if (tree.children.length == 0) {
    return [depth, tree.label.length];
  }
  return tree.children
    .map((t) => getStats(t, depth + 1))
    .reduce(
      ([runningDepth, runningWidth], [cDepth, cWidth]) => [
        Math.max(runningDepth, cDepth),
        runningWidth + cWidth,
      ],
      [0, 0]
    );
};

const normalizeLayout = (
  tree: SyntaxTree,
  maxDepth: number,
  totalWidth: number
) => {
  tree.layout = {
    x: (tree.layout.x + 1) / (totalWidth + 2),
    y: tree.layout.y / maxDepth,
  };
  tree.children.forEach((c) => normalizeLayout(c, maxDepth, totalWidth));
};

const addLayout = (
  tree: IntermediateParse,
  maxDepth: number,
  depth: number = 0,
  accumulatedWidth: number = 0
): number => {
  // Recurse to children first so we know how far on the x-axis
  // this node's subtree goes.
  let curWidth = accumulatedWidth;
  tree.children.forEach((c) => {
    curWidth = addLayout(c, maxDepth, depth + 1, curWidth);
  });
  let x: number;
  if (tree.children.length == 0) {
    x = curWidth + 0.5 * tree.label.length;
  } else {
    // If the node has children, put it in the center of them
    const childXs = tree.children.map((c) => c.layout?.x || 0);
    x = childXs.reduce((a, b) => a + b, 0) / tree.children.length;
  }
  // Set the layout
  tree.layout = { x: x, y: depth };
  if (tree.children.length == 0) {
    curWidth += tree.label.length;
  }
  return curWidth;
};

export const parse = (
  src: string,
  openingDelimiter: string,
  closingDelimiter: string
): SyntaxTree => {
  const input = preprocess(src, openingDelimiter, closingDelimiter);
  const [tree, _] = _parse(input, openingDelimiter, closingDelimiter);
  const [maxDepth, totalWidth] = getStats(tree);
  addLayout(tree, maxDepth);
  normalizeLayout(tree as SyntaxTree, maxDepth, totalWidth);
  return tree as SyntaxTree;
};
