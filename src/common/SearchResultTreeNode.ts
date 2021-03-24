import { TreeNode } from "./TreeNode";
import { QueryHierarchyItem } from "azure-devops-extension-api/WorkItemTracking";

/**
 * Used to represent a search result.
 */
export class SearchResultTreeNode<T,Y> extends TreeNode<T,Y> {

    /**
     * The source of the query results.
     */
    sourceQuery?:QueryHierarchyItem;

    /**
     * Create a tree node.
     *
     * @param data data at this node.
     * @param parent the parent node.
     */
    constructor(data:T|undefined, parent?:TreeNode<T,Y>) {
        super(data, parent);
    }
}