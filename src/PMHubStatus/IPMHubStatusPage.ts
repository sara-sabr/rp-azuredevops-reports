import { ProjectStatus } from "./ProjectStatus";
import { TreeNode } from "../common/TreeNode";

/**
 * Used by the status page to display current status and possible other statuses.
 */
export interface IPMHubStatusPage {
    currentStatus?: TreeNode<ProjectStatus, number> | undefined
}