import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";

export abstract class WorkItemBase {
    /**
     * The ID.
     */
    id:number = 0;

    /**
     * Populate the data from work item.
     *
     * @param workItem  the work item
     */
    public populateFromWorkItem(workItem: WorkItem):void {
        this.id = workItem.id;
    }
}