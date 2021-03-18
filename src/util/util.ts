import { WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";
import { WorkItemConstants } from "./WorkItemConstants";

export class Util {
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

        if ((state !== WorkItemConstants.STATE_IN_PROGRESS && state != WorkItemConstants.STATE_DONE) ||
            parent === undefined || parent === null) {
            // Ignoring all state changes outside of in progress and done.
            // Ignoring PBI with no parents.
            return;
        }

        if (state === WorkItemConstants.STATE_IN_PROGRESS) {
            // Execute the update start dates only.
            await Util.updateParents(witApiClient, parent, stateChangedDate, undefined);

        } else if (state === WorkItemConstants.STATE_DONE) {
            // Execute the update finish dates only.
            await Util.updateParents(witApiClient, parent, undefined, stateChangedDate);
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
            WorkItemConstants.FIELD_STATE,
            WorkItemConstants.FIELD_START_DATE,
            WorkItemConstants.FIELD_FINISH_DATE,
            WorkItemConstants.FIELD_PARENT_ID
        ]);

        const parentStartDate:Date = parentWit.fields[WorkItemConstants.FIELD_START_DATE];
        const parentFinishDate:Date = parentWit.fields[WorkItemConstants.FIELD_START_DATE];
        const grandParentId = parentWit.fields[WorkItemConstants.FIELD_PARENT_ID];

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
            await Util.updateParents(witApiClient, grandParentId, startDate, finishDate);
        }
    }
}