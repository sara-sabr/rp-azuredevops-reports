// Library Level
import { QueryHierarchyItem } from "azure-devops-extension-api/WorkItemTracking";

// Project Level
import { TreeNode } from "../Common/TreeNode";

/**
 * Used to represent a search result.
 */
export class SearchResultEntity<T, Y> extends TreeNode<T, Y> {
  /**
   * The source of the query results.
   */
  sourceQuery?: QueryHierarchyItem;

  /**.
   * The date of the results.
   */
  asOf?: Date;

  /**
   * Create a tree node.
   *
   * @param data data at this node.
   * @param parent the parent node.
   */
  constructor(data: T | undefined, parent?: TreeNode<T, Y>) {
    super(data, parent);
  }
}
