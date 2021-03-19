import { WorkItemTrackingRestClient, QueryHierarchyItem, WorkItemQueryResult, WorkItemLink, WorkItemExpand, WorkItemErrorPolicy, WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { getClient, CommonServiceIds, IProjectPageService } from "azure-devops-extension-api"
import { Constants } from "./Constants";
import * as SDK from "azure-devops-extension-sdk";
import { TreeNode } from "./TreeNode";
import { WorkItemBase } from "./WorkItemBase";


/**
 * Common utilities.
 */
export class Utils {
    /**
     * Singleton for work item client.
     */
    static readonly WIT_API_CLIENT = getClient(WorkItemTrackingRestClient);

    /**
     * Get the query.
     *
     * @param name the query name
     */
    static async getQuery(name: string):Promise<QueryHierarchyItem> {
        const projectName = await this.getProjectName();
        const queryFQN = this.buildQueryFQN(Constants.DEFAULT_QUERIES_SHARED_FOLDER, Constants.DEFAULT_QUERIES_EXTENSION_FOLDER, name);
        return this.WIT_API_CLIENT.getQuery(projectName, queryFQN);
    }

    /**
     * Execute the specified query.
     *
     * @param name the query name found inside the configuration folder.
     * @param type the class definition of results expected
     */
    static async executeTreeQuery<T extends WorkItemBase>(name:string,
        type: { new (): T }
        ):Promise<TreeNode<T>> {
        const query = await this.getQuery(name);

        if (query.isFolder) {
            throw new Error ("The specified query is a folder and not an actual query.");
        }

        const projectName = await this.getProjectName();
        const rootNode = new TreeNode<T>(undefined);
        let currentNode:TreeNode<T>;
        const nodeMap = new Map<number, TreeNode<T>>();
        let currentWorkItemLink:WorkItemLink;
        let data:T;

        const results = await this.WIT_API_CLIENT.queryById(query.id);
        // Loop over the results and create the tree.
        for (let idx = 0; idx < results.workItemRelations.length; idx++) {
            currentWorkItemLink = results.workItemRelations[idx];
            data = new type();
            data.id = currentWorkItemLink.target.id;

            currentNode = new TreeNode<T>(data);
            nodeMap.set(data.id, currentNode);

            if (currentWorkItemLink.rel === null) {
                // Top level node.
                rootNode.addChildren(currentNode);
            } else if (currentWorkItemLink.rel === Constants.WIT_REL_CHILD){
                // Has a parent and we should of seen it already.
                nodeMap.get(currentWorkItemLink.source.id)?.addChildren(currentNode);
            }
        }

        // Get the fields names.
        const fieldNames:string[] = [];
        for (let idx = 0; idx < results.columns.length; idx++) {
            fieldNames.push(results.columns[idx].referenceName);
        }

        // Now populate the data as we want to bulk request the data.
        let ids = Array.from(nodeMap.keys());
        const workItemDataResults = await this.WIT_API_CLIENT.getWorkItemsBatch({
            ids:ids,
            fields: fieldNames,
            $expand: WorkItemExpand.None,
            asOf: new Date(),
            errorPolicy: WorkItemErrorPolicy.Fail
        }, projectName);

        let workItem:WorkItem;
        for (let idx = 0; idx < workItemDataResults.length; idx++) {
            workItem = workItemDataResults[idx];
            nodeMap.get(workItem.id)?.data?.populateFromWorkItem(workItem);
        }

        return rootNode;
    }

    /**
     * Build up the query path based on paths.
     *
     * @param paths the path location.
     */
    private static buildQueryFQN(... paths:string[]):string {
        let buffer = "";
        for (let idx = 0; idx < paths.length; idx++) {
            if (idx > 0) {
                buffer += Constants.DEFAULT_QUERIES_SEPERATOR;
            }

            buffer += paths[idx];
        }

        return buffer;
    }

    /**
     * Get the current project name.
     *
     * @returns the current project name.
     */
    static async getProjectName():Promise<string> {
        const projectService = await this.getProjectService();
        const projectInfo = await projectService.getProject();

        if (projectInfo) {
            return projectInfo.name;
        }

        throw Error("Unable to get project info");
    }

    /**
     * Get the project service which provides access to the current project.
     *
     * @returns the project service
     */
    static async getProjectService():Promise<IProjectPageService> {
        return SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    }

    /**
     * Given the current update, check if the update was a state change. If state changed, then
     * see if we need to update the parent.
     *
     * @param witApiClient API client that is fully configured.
     * @param parent the parent ID
     * @param id the updated work item id
     * @param changedDate the work item last changed date
     * @param stateChangedDate the work item last state changed date
     * @param state the work item's state
     */
    static async validateAndUpdateParents(witApiClient: WorkItemTrackingRestClient, parent: number, id:number, changedDate:Date, stateChangedDate:Date, state:string): Promise<void> {

        if (stateChangedDate.getTime() !== changedDate.getTime()) {
            return;
        }

        if ((state !== Constants.WIT_STATE_IN_PROGRESS && state != Constants.WIT_STATE_DONE) ||
            parent === undefined || parent === null) {
            // Ignoring all state changes outside of in progress and done.
            // Ignoring PBI with no parents.
            return;
        }

        if (state === Constants.WIT_STATE_IN_PROGRESS) {
            // Execute the update start dates only.
            await Utils.updateParents(witApiClient, parent, stateChangedDate, undefined);

        } else if (state === Constants.WIT_STATE_DONE) {
            // Execute the update finish dates only.
            await Utils.updateParents(witApiClient, parent, undefined, stateChangedDate);
        }
    }

    /**
     * Given the current update, check if the update was a state change. If state changed, then
     * see if we need to update the parent.
     *
     * **Note**: Iterative function.
     *
     * @param witApiClient API client that is fully configured.
     * @param parent the parent ID
     * @param startDate the work item when it moved to In Progress.
     * @param finishDate the work item when it moved to Done.
     */
    private static async updateParents(witApiClient: WorkItemTrackingRestClient, parent: number, startDate?:Date, finishDate?:Date): Promise<void> {

        const parentWit = await witApiClient.getWorkItem(parent, undefined, [
            Constants.WIT_FIELD_STATE,
            Constants.WIT_FIELD_START_DATE,
            Constants.WIT_FIELD_FINISH_DATE,
            Constants.WIT_FIELD_PARENT_ID
        ]);

        const parentStartDate:Date = parentWit.fields[Constants.WIT_FIELD_START_DATE];
        const parentFinishDate:Date = parentWit.fields[Constants.WIT_FIELD_START_DATE];
        const grandParentId = parentWit.fields[Constants.WIT_FIELD_PARENT_ID];

        if (startDate) {
            if (parentStartDate == null || parentStartDate == undefined || parentStartDate.getTime() > startDate.getTime()) {
                console.log('Update ' + parent + ' start date to ' + startDate);
            }
        }

        if (finishDate) {
            if (parentFinishDate != null && parentFinishDate != undefined && parentFinishDate.getTime() < finishDate.getTime()) {
                console.log('Update ' + parent + ' finish date to ' + finishDate);
            }
        }

        if (grandParentId) {
            await Utils.updateParents(witApiClient, grandParentId, startDate, finishDate);
        }
    }
}