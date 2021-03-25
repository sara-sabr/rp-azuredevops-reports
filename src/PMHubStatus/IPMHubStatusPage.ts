import { ProjectStatus } from "./ProjectStatus";
import { SearchResultTreeNode } from "../common/SearchResultTreeNode";
import { QueryHierarchyItem } from "azure-devops-extension-api/WorkItemTracking";

/**
 * Used by the status page to display current status and possible other statuses.
 */
export interface IPMHubStatusPage {
  /**
   * Current result.
   */
  currentStatus?:
    | Map<string, SearchResultTreeNode<ProjectStatus, number>[]>
    | undefined;

  /**
   * The search query.
   */
  sourceQuery?: QueryHierarchyItem;

  /**
   * The query
   */
  queryUrl?: string;

  /**
   * Report Date.
   */
  reportDate?: Date | undefined;
}
