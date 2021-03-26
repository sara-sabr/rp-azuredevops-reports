import { ProjectStatus } from "./ProjectStatus";
import { SearchResultTreeNode } from "../common/SearchResultTreeNode";
import { QueryHierarchyItem } from "azure-devops-extension-api/WorkItemTracking";
import { PMStatusDocument } from "./PMStatusRecord";

/**
 * Used by the status page to display current status and possible other statuses.
 */
export interface IPMHubStatusPage {
  /**
   * Current result.
   */
  statusReport?:
    | Map<string, SearchResultTreeNode<ProjectStatus, number>[]>
    | undefined;

  /**
   * The search query.
   */
  currentSourceQuery?: QueryHierarchyItem;

  /**
   * The query
   */
  queryUrl?: string;

  /**
   * List of reports.
   */
  reportList:PMStatusDocument[];

  /**
   * The record being displayed.
   */
  record?:PMStatusDocument;
}
