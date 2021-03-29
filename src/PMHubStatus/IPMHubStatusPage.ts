// Library level
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { QueryHierarchyItem } from "azure-devops-extension-api/WorkItemTracking";

// Project Level
import { PMStatusDocument } from "./PMStatusRecord";
import { ProjectStatus } from "./ProjectStatus";
import { SearchResultTreeNode } from "../common/SearchResultTreeNode";

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
  reportList: IListBoxItem[];

  /**
   * The record being displayed.
   */
  record?: PMStatusDocument;
}
