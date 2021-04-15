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
import { Constants } from "../Common/Constants";
import { ProjectService } from "../Common/Project.service";
import { SearchResultEntity } from "./SearchResult.entity";
import { WorkItemBaseEntity } from "../Common/WorkItemBase.entity";
import { CommonRepositories } from "../Common/Common.repository";

/**
 * Search repository.
 */
export class SearchRepository {
  /**
   * Get the query url.
   *
   * @param query the query
   */
  static async getQueryURL(
    query: QueryHierarchyItem | undefined
  ): Promise<string> {
    let url = await ProjectService.getBaseUrl();
    if (query === undefined) {
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
    const projectName = await ProjectService.getProjectName();
    return CommonRepositories.WIT_API_CLIENT.getQuery(
      projectName,
      name,
      QueryExpand.Wiql
    );
  }

  /**
   * Helper to execute a wiql query and give the result.
   *
   * @param wiql the query to run
   * @param nodeMap the node map
   * @param rootNode the root not
   * @param type the type of object to create
   * @returns the results
   */
  private static async executeQueryHelperWiql<T extends WorkItemBaseEntity>(
    wiql: string,
    nodeMap: Map<number, SearchResultEntity<T, number>>,
    rootNode: SearchResultEntity<T, number>,
    type: { new (): T }
  ): Promise<SearchResultEntity<T, number>> {
    const projectName = await ProjectService.getProjectName();

    // Get results.
    const results = await CommonRepositories.WIT_API_CLIENT.queryByWiql(
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
      const workItemDataResults = await CommonRepositories.WIT_API_CLIENT.getWorkItemsBatch(
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
   * Execute the specified WIQL query.
   *
   * @param wiql the WIQL query.
   * @param type the class definition of results expected
   * @returns the results
   */
  static async executeQueryWiql<T extends WorkItemBaseEntity>(
    wiql: string,
    type: { new (): T }
  ): Promise<SearchResultEntity<T, number>> {
    const rootNode = new SearchResultEntity<T, number>(undefined);
    const nodeMap = new Map<number, SearchResultEntity<T, number>>();

    // Init the root node's data.
    rootNode.populateNodeMap(nodeMap);

    return this.executeQueryHelperWiql(wiql, nodeMap, rootNode, type);
  }

  /**
   * Execute the specified query.
   *
   * @param name the query name found inside the configuration folder.
   * @param type the class definition of results expected
   * @param asOf query history if specified
   * @returns the results
   */
  static async executeQuery<T extends WorkItemBaseEntity>(
    name: string,
    type: { new (): T },
    asOf?: Date
  ): Promise<SearchResultEntity<T, number>> {
    const query = await this.getQuery(name);

    if (query.isFolder) {
      throw new Error(
        "The specified query is a folder and not an actual query."
      );
    }

    const rootNode = new SearchResultEntity<T, number>(undefined);
    const nodeMap = new Map<number, SearchResultEntity<T, number>>();

    // Init the root node's data.
    rootNode.populateNodeMap(nodeMap);
    rootNode.sourceQuery = query;
    let wiql = query.wiql;

    if (asOf) {
      wiql += " ASOF '" + asOf.toISOString() + "'";
    }

    return this.executeQueryHelperWiql(wiql, nodeMap, rootNode, type);
  }

  /**
   * Process results when it is work item reference. Usually a flat result.
   *
   * @param nodeMap the node map
   * @param resultsValues the search result
   * @param rootNode the root node
   * @param type the type to instantiate
   */
  private static processWorkItem<T extends WorkItemBaseEntity>(
    nodeMap: Map<number, SearchResultEntity<T, number>>,
    resultsValues: WorkItemReference[],
    rootNode: SearchResultEntity<T, number>,
    type: { new (): T }
  ): void {
    let workItemReference: WorkItemReference;
    let data: T;
    let currentNode: SearchResultEntity<T, number>;

    // Loop over the results and create the tree.
    for (let idx = 0; idx < resultsValues.length; idx++) {
      workItemReference = resultsValues[idx];
      data = new type();
      data.id = workItemReference.id;
      currentNode = new SearchResultEntity<T, number>(data);
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
  private static processWorkItemReference<T extends WorkItemBaseEntity>(
    nodeMap: Map<number, SearchResultEntity<T, number>>,
    resultsValues: WorkItemLink[],
    rootNode: SearchResultEntity<T, number>,
    type: { new (): T }
  ): void {
    let currentWorkItemLink: WorkItemLink;
    let data: T;
    let currentNode: SearchResultEntity<T, number>;

    // Loop over the results and create the tree.
    for (let idx = 0; idx < resultsValues.length; idx++) {
      currentWorkItemLink = resultsValues[idx];
      data = new type();
      data.id = currentWorkItemLink.target.id;
      currentNode = new SearchResultEntity<T, number>(data);
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
