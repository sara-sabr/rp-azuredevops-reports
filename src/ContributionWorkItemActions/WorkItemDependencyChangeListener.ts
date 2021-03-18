import { IWorkItemNotificationListener, IWorkItemChangedArgs, IWorkItemLoadedArgs, IWorkItemFieldChangedArgs, WorkItemTrackingServiceIds, IWorkItemFormService, WorkItemExpand } from "azure-devops-extension-api/WorkItemTracking";

import { WorkItemConstants } from "../util/WorkItemConstants";
import * as SDK from "azure-devops-extension-sdk";
import { Util } from "../util/util";


/**
 * Listener on change events while inside a work item form.
 *
 * **Note**
 *
 * We rely on actual saved record information for whether the state was transitioned or not as
 * the onFieldChanged method will flag fields as change even though the content was reverted manually.
 */
export class WorkItemDependencyChangeListener implements IWorkItemNotificationListener {
    /**
     * Is the given form a new item.
     */
    isNew:boolean = false;

    /**
     * The ID of the work item.
     */
    id:number =0;

    /**
     * IS the form in read only mode, therefore no changes are happening.
     */
    isReadOnly:boolean = false;

    onLoaded(workItemLoadedArgs: IWorkItemLoadedArgs): void {
        this.isNew = workItemLoadedArgs.isNew;
        this.isReadOnly = workItemLoadedArgs.isReadOnly;
    };

    onFieldChanged(fieldChangedArgs:IWorkItemFieldChangedArgs): void {
        // Do nothing, as this event is misleading.
        // If you revert your change manually, it is still considered changed.
        // For example, flipping "State" from "In Progress" to "Ready" to "In Progress"
        // should have an empty changed fields, however that is not the case.
    };

    async onSaved(savedEventArgs:IWorkItemChangedArgs): Promise<void> {
        const workItemFormService:IWorkItemFormService = await SDK.getService(WorkItemTrackingServiceIds.WorkItemFormService);
        const stateChangedDate:Date = await workItemFormService.getFieldValue(WorkItemConstants.FIELD_STATE_CHANGED) as Date;
        const witChangedDate:Date = await workItemFormService.getFieldValue(WorkItemConstants.FIELD_CHANGED) as Date;
        const state:string  = await workItemFormService.getFieldValue(WorkItemConstants.FIELD_STATE) as string;

        // Check if we have a parent.
        const witFields = await workItemFormService.getFieldValues([WorkItemConstants.FIELD_PARENT_ID])
        const parent:number = witFields[WorkItemConstants.FIELD_PARENT_ID] as number;

        await Util.validateAndUpdateParents(WorkItemConstants.WIT_API_CLIENT, parent, savedEventArgs.id, witChangedDate, stateChangedDate, state);
    };

    onRefreshed(refreshEventArgs:IWorkItemChangedArgs): void {
        // Do nothing.
    };

    onReset(undoEventArgs:IWorkItemChangedArgs): void {
        // Do nothing.
    };

    onUnloaded(unloadedEventArgs:IWorkItemChangedArgs): void {
        // Do nothing.
    };
}