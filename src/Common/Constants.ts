/**
 * Constants.
 */
export class Constants {
  /**
   * Default folder for shared queries.
   */
  static readonly DEFAULT_QUERIES_SHARED_FOLDER = "Shared Queries";

  /**
   * The sepeartor for folders in Azure DevOps.
   */
  static readonly DEFAULT_QUERIES_SEPERATOR = "/";

  /**
   * The default folder in Queries for the extension under the "Shared Queries".
   */
  static readonly DEFAULT_QUERIES_EXTENSION_FOLDER = "Automation";

  /**
   * State for in progress when once transitioned, it is considered that work
   * has begun.
   */
  static readonly WIT_STATE_IN_PROGRESS = "In Progress";

  /**
   * State for closed when once transitioned, it is considered to be completed on
   * that date.
   */
  static readonly WIT_STATE_DONE = "Done";

  /**
   * Label for PBIs.
   */
  static readonly WIT_TYPE_PBI = "Product Backlog Item";

  /**
   * Label for Goals.
   */
  static readonly WIT_TYPE_GOAL = "Goal";

  /**
   * Label for Feature.
   */
  static readonly WIT_TYPE_FEATURE = "Feature";

  /**
   * Label for Imepediment.
   */
  static readonly WIT_TYPE_IMPEDIMENT = "Impediment";

  /**
   * Label for Epic.
   */
  static readonly WIT_TYPE_EPIC = "Epic";

  /**
   * The system name for the ID field.
   */
  static readonly WIT_FIELD_ID = "System.Id";

  /**
   * The system name for the project field.
   */
  static readonly WIT_FIELD_PROJECT = "System.TeamProject";

  /**
   * The system name for the iteration identifier field.
   */
  static readonly WIT_FIELD_ITERATION_ID = "System.IterationId";

  /**
   * The system name for the iteration path field.
   */
  static readonly WIT_FIELD_ITERATION_PATH = "System.IterationPath";

  /**
   * The system name for the state field.
   */
  static readonly WIT_FIELD_STATE = "System.State";

  /**
   * The system name for the Parent ID field.
   */
  static readonly WIT_FIELD_PARENT_ID = "System.Parent";

  /**
   * The system name for risk field.
   */
  static readonly WIT_FIELD_RISK = "Microsoft.VSTS.Common.Risk";

  /**
   * The system name for priority field.
   */
  static readonly WIT_FIELD_PRIORITY = "Microsoft.VSTS.Common.Risk";

  /**
   * The system name for action field.
   */
  static readonly WIT_FIELD_ACTION = "Custom.Action";

  /**
   * The system name for description field.
   */
  static readonly WIT_FIELD_DESCRIPTION = "System.Description";

  /**
   * The system name for title field.
   */
  static readonly WIT_FIELD_TITLE = "System.Title";

  /**
   * The system name for work item type.
   */
  static readonly WIT_FIELD_TYPE = "System.WorkItemType";

  /**
   * The system name for area path.
   */
  static readonly WIT_FIELD_AREA_PATH = "System.AreaPath";

  /**
   * The system name for the state changed date field.
   */
  static readonly WIT_FIELD_STATE_CHANGED =
    "Microsoft.VSTS.Common.StateChangeDate";

  /**
   * The system name for the WIT changed date field.
   */
  static readonly WIT_FIELD_CHANGED = "System.ChangedDate";

  /**
   * The system name for the start date.
   */
  static readonly WIT_FIELD_START_DATE = "Microsoft.VSTS.Scheduling.StartDate";

  /**
   * The system name for the target date.
   */
  static readonly WIT_FIELD_TARGET_DATE =
    "Microsoft.VSTS.Scheduling.TargetDate";

  /**
   * The system name for the due date.
   */
  static readonly WIT_FIELD_DUE_DATE = "Microsoft.VSTS.Scheduling.DueDate";

  /**
   * The system name for the finish date.
   */
  static readonly WIT_FIELD_FINISH_DATE =
    "Microsoft.VSTS.Scheduling.FinishDate";

  /**
   * The relation is a child reference, therfore the source is the parent
   * and the target is the child.
   */
  static readonly WIT_REL_CHILD = "System.LinkTypes.Hierarchy-Forward";

  /**
   * The relation is a related reference.
   */
  static readonly WIT_REL_RELATED = "System.LinkTypes.Related";

  /**
   * Risk level low.
   */
  static readonly WIT_RISK_LOW = "3 - Low";

  /**
   * Risk level medium.
   */
  static readonly WIT_RISK_MED = "2 - Medium";

  /**
   * Risk level high.
   */
  static readonly WIT_RISK_HIGH = "1 - High";
}
