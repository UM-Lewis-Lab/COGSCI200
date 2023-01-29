export type SyntaxTree = {
  label: string;
  children: SyntaxTree[];
  subTreeWidths: number[];
  layout: { x: number; y: number };
};

type StopIndex = number;

const preprocess = (
  src: string,
  openingDelimiter: string,
  closingDelimiter: string
): [string[], number] => {
  const chars = [...src];
  let depth = 0;
  let maxDepth = 0;
  let start: number = 0;
  let end: number = chars.length;
  chars.forEach((c, i) => {
    if (c == openingDelimiter) {
      if (depth == 0) {
        start = i;
      }
      depth++;
      if (depth > maxDepth) {
        maxDepth = depth;
      }
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
  return [chars.slice(start + 1, end), maxDepth];
};

type IntermediateParse = {
  label: string;
  children: IntermediateParse[];
  subTreeWidths?: number[];
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

const addSubtreeWidths = (tree: IntermediateParse) => {
  if (tree.children.length == 0) {
    tree.subTreeWidths = [tree.label.length];
  } else {
    tree.children.forEach(addSubtreeWidths);
    tree.subTreeWidths = tree.children.map((t) =>
      (t.subTreeWidths || [0]).reduce((a, b) => a + b, 0)
    );
  }
};

const addStructure = (
  tree: IntermediateParse,
  rootWidth: number,
  maxDepth: number,
  depth: number = 0,
  rootXUnscaled: number = 0
) => {
  // Calculate the X coordinate for this node
  const subTreeWidths = tree.subTreeWidths;
  const offset = (subTreeWidths || []).reduce((a, b) => a + b, 0) / 2;
  const nodeXUnscaled = rootXUnscaled + offset;

  // Create the node
  tree.layout = {
    x: nodeXUnscaled / rootWidth,
    y: depth / maxDepth,
  };

  // Create nodes for children
  tree.children.forEach((t, i) => {
    let x: number;
    if (i / tree.children.length < 0.5) {
      x = rootXUnscaled;
    } else {
      x = nodeXUnscaled;
    }
    addStructure(t, rootWidth, maxDepth, depth + 1, x);
  });
};

export const parse = (
  src: string,
  openingDelimiter: string,
  closingDelimiter: string
): SyntaxTree => {
  const [input, maxDepth] = preprocess(src, openingDelimiter, closingDelimiter);
  const [tree, _] = _parse(input, openingDelimiter, closingDelimiter);
  addSubtreeWidths(tree);
  addStructure(
    tree,
    (tree.subTreeWidths || []).reduce((a, b) => a + b, 0),
    maxDepth
  );
  return tree as SyntaxTree;
};
