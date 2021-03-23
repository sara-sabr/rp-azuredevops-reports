import { IPMHubStatusPage } from "./IPMHubStatusPage";
import { TreeNode } from "../common/TreeNode";
import { ProjectStatus } from "./ProjectStatus";
import { Utils } from "../common/Utils";
import { PMHubStatusConfiguration } from "./Configuration";
import { Impediments } from "./Impediments";
import { Constants } from "../common/Constants";

export class PMHubStatusUtils {

    /**
     * Populate the impediments for all projects referenced.
     *
     * @param currentStatus the current status.
     */
    private static async populateImpediments(currentStatus: TreeNode<ProjectStatus, number>):Promise<void> {
        const nodeMap = currentStatus.nodeMap;

        if (nodeMap === undefined) {
            throw new Error("Node map should not by empty.");
        }

        // Get the list of impediments.
        const impedimentsResults:TreeNode<Impediments, number> = await Utils.executeTreeQuery(PMHubStatusConfiguration.getQueryImpediments(), Impediments);
        let relatedId:number;
        let relatedNode:TreeNode<ProjectStatus, number> | undefined;

        for (let node of impedimentsResults.children) {
            if (node === undefined || node.data === undefined) {
                continue;
            }

            // Parent is either a feature or epic and child is the impediment itself.
            if (node.data.type === Constants.WIT_TYPE_EPIC) {
                relatedId = node.data.id;
            } else if (node.data.type === Constants.WIT_TYPE_FEATURE) {
                relatedId = node.data.parent;
            } else {
                continue;
            }

            relatedNode = nodeMap.get(relatedId);

            if (relatedNode && relatedNode.data) {
                // We have an impediment mapped to a project.
                relatedNode.data.addImpediment(node.data.title);
            }
        }
    }

    /**
     * Get the latest project status.
     *
     * @returns the latest project statues.
     */
    static async getLatestProjectStatuses(): Promise<TreeNode<ProjectStatus, number>> {
        const projectStatus:TreeNode<ProjectStatus, number> = await Utils.executeTreeQuery(PMHubStatusConfiguration.getQueryForLatestStatus(), ProjectStatus);
        await PMHubStatusUtils.populateImpediments(projectStatus);
        return projectStatus;
    }
}