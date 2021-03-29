// Library Level
import {
  QueryExpand,
  QueryHierarchyItem,
  QueryResultType,
  WorkItem,
  WorkItemErrorPolicy,
  WorkItemExpand,
  WorkItemLink,
  WorkItemReference
} from "azure-devops-extension-api/WorkItemTracking";

// Project Level
import { Constants } from "./Constants";
import { ProjectUtils } from "./ProjectUtils";
import { SearchResultTreeNode } from "./SearchResultTreeNode";
import { WorkItemBase } from "./WorkItemBase";

/**
 * Search utilities.
 */
export class SearchUtils {
  /**
   * Get the query url.
   *
   * @param query the query
   */
  static async getQueryURL(
    query: QueryHierarchyItem | undefined
  ): Promise<string> {
    let url = await ProjectUtils.getBaseUrl();
    if (query == undefined) {
      throw new Error("Query cannot be empty.");
    }
    url += "/_queries/query/" + query.id;
    return url;
  }

  /**
   * Get the query.
   *
   * @param name the query name
   */
  static async getQuery(name: string): Promise<QueryHierarchyItem> {
    const projectName = await ProjectUtils.getProjectName();
    return ProjectUtils.WIT_API_CLIENT.getQuery(
      projectName,
      name,
      QueryExpand.Wiql
    );
  }

  /**
   * Execute the specified query.
   *
   * @param name the query name found inside the configuration folder.
   * @param type the class definition of results expected
   * @param asOf query history if specified
   */
  static async executeQuery<T extends WorkItemBase>(
    name: string,
    type: { new (): T },
    asOf?: Date
  ): Promise<SearchResultTreeNode<T, number>> {
    const query = await this.getQuery(name);

    if (query.isFolder) {
      throw new Error(
        "The specified query is a folder and not an actual query."
      );
    }

    const rootNode = new SearchResultTreeNode<T, number>(undefined);
    const nodeMap = new Map<number, SearchResultTreeNode<T, number>>();

    // Init the root node's data.
    rootNode.populateNodeMap(nodeMap);
    rootNode.sourceQuery = query;

    const projectName = await ProjectUtils.getProjectName();
    let wiql = query.wiql;

    if (asOf) {
      wiql += " ASOF '" + asOf.toISOString() + "'";
    }

    // Get results.
    const results = await ProjectUtils.WIT_API_CLIENT.queryByWiql(
      { query: wiql },
      projectName
    );
    rootNode.asOf = results.asOf;

    if (results.queryResultType === QueryResultType.WorkItem) {
      this.processWorkItem(nodeMap, results.workItems, rootNode, type);
    } else {
      this.processWorkItemReference(
        nodeMap,
        results.workItemRelations,
        rootNode,
        type
      );
    }

    if (nodeMap.size > 0) {
      // Get the fields names.
      const fieldNames: string[] = [];
      for (let idx = 0; idx < results.columns.length; idx++) {
        fieldNames.push(results.columns[idx].referenceName);
      }

      // Now populate the data as we want to bulk request the data.
      let ids = Array.from(nodeMap.keys());
      const workItemDataResults = await ProjectUtils.WIT_API_CLIENT.getWorkItemsBatch(
        {
          ids: ids,
          fields: fieldNames,
          $expand: WorkItemExpand.None,
          asOf: results.asOf,
          errorPolicy: WorkItemErrorPolicy.Fail
        },
        projectName
      );

      let workItem: WorkItem;
      for (let idx = 0; idx < workItemDataResults.length; idx++) {
        workItem = workItemDataResults[idx];
        nodeMap.get(workItem.id)?.data?.populateFromWorkItem(workItem);
      }
    }

    return rootNode;
  }

  /**
   * Process results when it is work item reference. Usually a flat result.
   *
   * @param nodeMap the node map
   * @param resultsValues the search result
   * @param rootNode the root node
   * @param type the type to instantiate
   */
  private static processWorkItem<T extends WorkItemBase>(
    nodeMap: Map<number, SearchResultTreeNode<T, number>>,
    resultsValues: WorkItemReference[],
    rootNode: SearchResultTreeNode<T, number>,
    type: { new (): T }
  ): void {
    let workItemReference: WorkItemReference;
    let data: T;
    let currentNode: SearchResultTreeNode<T, number>;

    // Loop over the results and create the tree.
    for (let idx = 0; idx < resultsValues.length; idx++) {
      workItemReference = resultsValues[idx];
      data = new type();
      data.id = workItemReference.id;
      currentNode = new SearchResultTreeNode<T, number>(data);
      nodeMap.set(data.id, currentNode);
      rootNode.addChildren(currentNode);
    }
  }

  /**
   * Process results when it is a work item link. Usually a tree result.
   *
   * @param nodeMap the node map
   * @param resultsValues the search result
   * @param rootNode the root node
   * @param type the type to instantiate
   */
  private static processWorkItemReference<T extends WorkItemBase>(
    nodeMap: Map<number, SearchResultTreeNode<T, number>>,
    resultsValues: WorkItemLink[],
    rootNode: SearchResultTreeNode<T, number>,
    type: { new (): T }
  ): void {
    let currentWorkItemLink: WorkItemLink;
    let data: T;
    let currentNode: SearchResultTreeNode<T, number>;

    // Loop over the results and create the tree.
    for (let idx = 0; idx < resultsValues.length; idx++) {
      currentWorkItemLink = resultsValues[idx];
      data = new type();
      data.id = currentWorkItemLink.target.id;
      currentNode = new SearchResultTreeNode<T, number>(data);
      nodeMap.set(data.id, currentNode);

      if (currentWorkItemLink.rel === null) {
        // Top level node.
        rootNode.addChildren(currentNode);
      } else if (
        currentWorkItemLink.rel === Constants.WIT_REL_CHILD ||
        currentWorkItemLink.rel === Constants.WIT_REL_RELATED
      ) {
        // Has a parent and we should of seen it already.
        nodeMap.get(currentWorkItemLink.source.id)?.addChildren(currentNode);
      }
    }
  }

  /**
   * Build up the query path based on paths.
   *
   * @param paths the path location.
   */
  public static buildQueryFQN(...paths: string[]): string {
    let buffer = "";
    for (let idx = 0; idx < paths.length; idx++) {
      if (idx > 0) {
        buffer += Constants.DEFAULT_QUERIES_SEPERATOR;
      }

      buffer += paths[idx];
    }

    return buffer;
  }
}
