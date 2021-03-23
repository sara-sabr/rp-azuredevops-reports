import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";
import { Constants } from "../common/Constants";
import { PMHubStatusConfiguration } from "./Configuration";
import { WorkItemBase } from "../common/WorkItemBase";

/**
 * The project status on the status report page.
 */
export class ProjectStatus extends WorkItemBase {
    /**
     * The current status.
     */
    status:string = "";

    /**
     * Risk level
     */
    riskLevel:string = "";

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
    keyIssues:string[] = [];

    /**
     * The target date
     */
    targetDate?:Date;

    public populateFromWorkItem(workItem:WorkItem):void {
        super.populateFromWorkItem(workItem);
        this.status = workItem.fields[PMHubStatusConfiguration.getFieldStatus()];
        this.riskLevel = workItem.fields[PMHubStatusConfiguration.getFieldRisk()];
        this.action = workItem.fields[PMHubStatusConfiguration.getFieldAction()];
        this.objective = workItem.fields[PMHubStatusConfiguration.getFieldObjective()];
        this.targetDate = workItem.fields[PMHubStatusConfiguration.getFieldTargetDate()];
    }

    /**
     * Add the impediment to the list.
     *
     * @param impedimentTitle the title of the impediment.
     */
    public addImpediment(impedimentTitle:string) {
        this.keyIssues.push(impedimentTitle);
    }
}