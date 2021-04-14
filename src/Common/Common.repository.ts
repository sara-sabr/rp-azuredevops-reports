// Libraries
import {
  getClient
} from "azure-devops-extension-api";
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
}