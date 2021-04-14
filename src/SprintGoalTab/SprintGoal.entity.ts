// Library
import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";

// Project level
import { WorkItemBaseEntity } from "../Common/WorkItemBase.entity";
import { Constants } from "../Common/Constants";

/**
 * Sprint goal entity which is a wrapper to a work item.
 */
export class SprintGoalEntity extends WorkItemBaseEntity {
  /**
   * The current status.
   */
  status: string = "";

  /**
   * Sprint goal description
   */
  description: string = "";

  /**
   * The area path.
   */
  areaPath: string = "";

  /**
   * The iteration path.
   */
  iterationPath: string = "";

  public populateFromWorkItem(workItem: WorkItem): void {
    super.populateFromWorkItem(workItem);
    this.areaPath = workItem.fields[Constants.WIT_FIELD_AREA_PATH];
    this.iterationPath = workItem.fields[Constants.WIT_FIELD_ITERATION_PATH];
    this.description = workItem.fields[Constants.WIT_FIELD_DESCRIPTION];
    this.status = workItem.fields[Constants.WIT_FIELD_STATE];
  }
}
