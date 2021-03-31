// Library Level
import { WorkItem } from "azure-devops-extension-api/WorkItemTracking";

// Project Level
import { Constants } from "./Constants";

export abstract class WorkItemBaseEntity {
  /**
   * The ID.
   */
  id: number = 0;

  /**
   * The parent ID.
   */
  parent: number = 0;

  /**
   * The work item type.
   */
  type: string = "";

  /**
   * The source work item being referenced.
   */
  sourceWorkItem: WorkItem | undefined;

  /**
   * The title the work item.
   */
  title: string = "";

  /**
   * Populate the data from work item.
   *
   * @param workItem  the work item
   */
  public populateFromWorkItem(workItem: WorkItem): void {
    this.sourceWorkItem = workItem;
    this.id = workItem.id;
    this.parent = workItem.fields[Constants.WIT_FIELD_PARENT_ID];
    this.type = workItem.fields[Constants.WIT_FIELD_TYPE];
    this.title = workItem.fields[Constants.WIT_FIELD_TITLE];
  }
}
