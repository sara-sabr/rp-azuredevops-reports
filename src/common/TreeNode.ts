export class TreeNode<T> {
    /**
     * Data at this node.
     */
    data:T | undefined;

    /**
     * The parent node.
     */
    parent:TreeNode<T> | undefined;

    /**
     * The children.
     */
    children:TreeNode<T>[] = [];

    /**
     * Create a tree node.
     *
     * @param data data at this node.
     * @param parent the parent node.
     */
    constructor(data:T|undefined, parent?:TreeNode<T>) {
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
    public addChildren(child:TreeNode<T>) {
        this.children.push(child);
        child.parent = this;
    }

    /**
     * Top level nodes are nodes where the root node is the parent.
     *
     * @returns true when top level node.
     */
    public isTopLevelNode():boolean {
        return this.parent !== undefined && this.parent.parent == undefined;
    }

    /**
     * Walk the tree
     *
     * @param node the node to start walking
     */
    public static walkTreePreOrder<T>(node:TreeNode<T>):TreeNode<T>[] {
        const result:TreeNode<T>[] = [];

        if (node.data != null) {
            result.push(node);
        }

        let childArray:TreeNode<T>[];

        for (let idx = 0; idx < node.children.length; idx++) {
            childArray = TreeNode.walkTreePreOrder(node.children[idx]);
            result.push(... childArray);
        }

        return result;
    }
}