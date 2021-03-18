import { WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";
import { getClient } from "azure-devops-extension-api"

/**
 * Consttants.
 */
export class WorkItemConstants {
    /**
     * State for in progress when once transitioned, it is considered that work
     * has begun.
     */
    static readonly STATE_IN_PROGRESS = "In Progress";

    /**
     * State for closed when once transitioned, it is considered to be completed on
     * that date.
     */
    static readonly STATE_DONE = "Done";

    /**
     * Label for PBIs.
     */
    static readonly WIT_PBI = "Product Backlog Item";

    /**
     * The system name for the ID field.
     */
    static readonly FIELD_WIT_ID = "System.Id";

    /**
     * The system name for the iteration identifier field.
     */
    static readonly FIELD_ITERATION_ID = "System.IterationId";

    /**
     * The system name for the state field.
     */
    static readonly FIELD_STATE = "System.State";

    /**
     * The system name for the Parent ID field.
     */
    static readonly FIELD_PARENT_ID = "System.Parent";

    /**
     * The system name for the state changed date field.
     */
    static readonly FIELD_STATE_CHANGED = "Microsoft.VSTS.Common.StateChangeDate";

    /**
     * The system name for the WIT changed date field.
     */
    static readonly FIELD_CHANGED = "System.ChangedDate";

    /**
     * The system name for the start date.
     */
    static readonly FIELD_START_DATE = "Microsoft.VSTS.Scheduling.StartDate";

    /**
     * The system name for the finish date.
     */
    static readonly FIELD_FINISH_DATE = "Microsoft.VSTS.Scheduling.FinishDate";

    /**
     * Singleton for work item client.
     */
    static readonly WIT_API_CLIENT = getClient(WorkItemTrackingRestClient);
}