import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { Constants } from "../common/Constants";
import { PMHubStatusConfiguration } from "./Configuration";
import { WorkItemBase } from "../common/WorkItemBase";

export class ProjectStatus extends WorkItemBase {
    /**
     * The title.
     */
    title:string = "";

    /**
     * The current status.
     */
    status:string = "";

    /**
     * Risk level
     */
    riskLevel:number = 0;

    /**
     * The objective.
     */
    objective:string = "";

    /**
     * The current status.
     */
    action:string = "";

    /**
     * The key issues.
     */
    keyIssues:string = "";

    public populateFromWorkItem(workItem:WorkItem):void {
        super.populateFromWorkItem(workItem);
        this.title = workItem.fields[PMHubStatusConfiguration.getFieldTitle()];
        this.status = workItem.fields[PMHubStatusConfiguration.getFieldStatus()];
        this.riskLevel = workItem.fields[PMHubStatusConfiguration.getFieldRisk()];
        this.action = workItem.fields[PMHubStatusConfiguration.getFieldAction()];
        this.objective = workItem.fields[PMHubStatusConfiguration.getFieldObjective()];
    }
}