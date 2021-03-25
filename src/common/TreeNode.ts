export class TreeNode<T, Y> {
  /**
   * Data at this node.
   */
  data: T | undefined;

  /**
   * The parent node.
   */
  parent: TreeNode<T, Y> | undefined;

  /**
   * The children.
   */
  children: TreeNode<T, Y>[] = [];

  /**
   * The map of all nodes to their reference key. Only populate it for the root node.
   */
  nodeMap?: Map<Y, TreeNode<T, Y>>;

  /**
   * Create a tree node.
   *
   * @param data data at this node.
   * @param parent the parent node.
   */
  constructor(data: T | undefined, parent?: TreeNode<T, Y>) {
    if (data) {
      this.data = data;
    }

    if (parent) {
      parent.addChildren(this);
    } else {
      this.parent = undefined;
    }
  }

  /**
   * Add a child node to the list.
   *
   * @param child the child node.
   */
  public addChildren(child: TreeNode<T, Y>) {
    this.children.push(child);
    child.parent = this;
  }

  /**
   * Top level nodes are nodes where the root node is the parent.
   *
   * @returns true when top level node.
   */
  public isTopLevelNode(): boolean {
    return this.parent !== undefined && this.parent.parent == undefined;
  }

  /**
   * Populate the node map for the root node.
   *
   * @param nodeMap the node map of all nodes in the tree.
   */
  public populateNodeMap(nodeMap: Map<Y, TreeNode<T, Y>>): void {
    this.nodeMap = nodeMap;
  }

  /**
   * Check if empty result.
   *
   * @returns true when the tree contains no nodes.
   */
  public isEmpty(): boolean {
    if (this.children) {
      return this.children.length === 0;
    }

    return true;
  }

  /**
   * Walk the tree
   *
   * @param node the node to start walking
   */
  public static walkTreePreOrder<T, Y>(node: TreeNode<T, Y>): TreeNode<T, Y>[] {
    const result: TreeNode<T, Y>[] = [];

    if (node.data != null) {
      result.push(node);
    }

    let childArray: TreeNode<T, Y>[];

    for (let idx = 0; idx < node.children.length; idx++) {
      childArray = TreeNode.walkTreePreOrder(node.children[idx]);
      result.push(...childArray);
    }

    return result;
  }
}
