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
     * Walk the tree
     *
     * @param node the node to start walking
     */
    public static walkTreePreOrder<T>(node:TreeNode<T>):T[] {
        const result:T[] = [];

        if (node.data != null) {
            result.push(node.data);
        }

        let childArray:T[];

        for (let idx = 0; idx < node.children.length; idx++) {
            childArray = TreeNode.walkTreePreOrder(node.children[idx]);
            result.push(... childArray);
        }

        return result;
    }
}