// Libraries
import { getClient } from "azure-devops-extension-api";
import { CoreRestClient } from "azure-devops-extension-api/Core";
import { WorkItemTrackingProcessRestClient } from "azure-devops-extension-api/WorkItemTrackingProcess";
import { WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";
import { WorkRestClient } from "azure-devops-extension-api/Work";

/**
 * Core repositories which maps to the rest clients.
 */
export class CommonRepositories {
  /**
   * Singleton for work item tracking client.
   */
  static readonly WIT_API_CLIENT = getClient(WorkItemTrackingRestClient);

  /**
   * Singleton for work client.
   */
  static readonly WORK_API_CLIENT = getClient(WorkRestClient);

  /**
   * Singleton for work process client.
   */
  static readonly PROCESS_API_CLIENT = getClient(WorkItemTrackingProcessRestClient);

  /**
   * Singleton for core client.
   */
  static readonly CORE_API_CLIENT = getClient(CoreRestClient);
}
