// Library Level
import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";

// Project Level
import { StatusReportConfig } from "./StatusReport.config";
import { WorkItemBaseEntity } from "../Common/WorkItemBase.entity";
import { ImpedimentsEntity } from "./Impediments.entity";

/**
 * The status entry for the status report page.
 */
export class StatusEntryEntity extends WorkItemBaseEntity {
  /**
   * The current status.
   */
  status: string = "";

  /**
   * Risk level
   */
  riskLevel: string = "";

  /**
   * The objective.
   */
  objective: string = "";

  /**
   * The current status.
   */
  action: string = "";

  /**
   * The key issues.
   */
  keyIssues: ImpedimentsEntity[] = [];

  /**
   * The target date
   */
  targetDate?: Date;

  public populateFromWorkItem(workItem: WorkItem): void {
    super.populateFromWorkItem(workItem);
    this.status = workItem.fields[StatusReportConfig.getFieldStatus()];
    this.riskLevel = workItem.fields[StatusReportConfig.getFieldRisk()];
    this.action = workItem.fields[StatusReportConfig.getFieldAction()];
    this.objective = workItem.fields[StatusReportConfig.getFieldObjective()];
    this.targetDate = workItem.fields[StatusReportConfig.getFieldTargetDate()];
  }

  /**
   * Add the impediment to the list.
   *
   * @param impediment the impediment.
   */
  public addImpediment(impediment: ImpedimentsEntity) {
    this.keyIssues.push(impediment);
  }
}
