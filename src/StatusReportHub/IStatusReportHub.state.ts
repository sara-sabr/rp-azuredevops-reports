// Library level
import { QueryHierarchyItem } from "azure-devops-extension-api/WorkItemTracking";

// Project Level
import { StatusReportEntity } from "./StatusReport.entity";
import { StatusEntryEntity } from "./StatusEntry.entity";
import { SearchResultEntity } from "../Search/SearchResult.entity";

/**
 * Used by the status page to display current status and possible other statuses.
 */
export interface IStatusReportHubState {
  /**
   * Current result.
   */
  statusReport?:
    | Map<string, SearchResultEntity<StatusEntryEntity, number>[]>
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
   * The record being displayed.
   */
  record?: StatusReportEntity;
}
