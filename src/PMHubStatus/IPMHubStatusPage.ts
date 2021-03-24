import { ProjectStatus } from "./ProjectStatus";
import { SearchResultTreeNode } from "../common/SearchResultTreeNode";

/**
 * Used by the status page to display current status and possible other statuses.
 */
export interface IPMHubStatusPage {
    /**
     * Current result.
     */
    currentStatus?: SearchResultTreeNode<ProjectStatus, number> | undefined;

    /**
     * The query
     */
    queryUrl?:string;
}