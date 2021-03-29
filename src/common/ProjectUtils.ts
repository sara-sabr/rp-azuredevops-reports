// Libraries
import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  IExtensionDataManager,
  IExtensionDataService,
  ILocationService,
  IProjectInfo,
  IProjectPageService,
  getClient
} from "azure-devops-extension-api";
import { WorkItemTrackingRestClient } from "azure-devops-extension-api/WorkItemTracking";

// Function Import
import { format as formatDate } from "date-fns";

// Project Level
import { Constants } from "./Constants";

/**
 * Project utilities.
 */
export class ProjectUtils {
  /**
   * Singleton for work item client.
   */
  static readonly WIT_API_CLIENT = getClient(WorkItemTrackingRestClient);

  /**
   * The singleton local service.
   */
  private static SERVICE_LOCATION: ILocationService;

  /**
   * The singleton and project service.
   */
  private static SERVICE_PROJECT: IProjectPageService;

  /**
   * The singleton for the data service.
   */
  private static SERVICE_DATA: IExtensionDataManager;

  /**
   * The Base URL of this project.
   */
  static BASE_URL: string;

  /**
   * Display a date without time.
   *
   * @param date date
   * @param separator true to include separator '-', otherwise none used.
   *
   * @returns a date in format YYYY-MM-DD or YYYYMMDD.
   */
  public static formatDateWithNoTime(date: Date, separator = true): string {
    // The formats are using fn-date, so not matching comments, but
    // as the comments pretty understandable, not going to change comment,
    // What 'k' stands for and difference between Y and y is just going to
    // confuse the caller.
    if (separator) {
      return formatDate(date, "yyyy-MM-dd");
    } else {
      return formatDate(date, "yyyyMMdd");
    }
  }

  /**
   * Display a date with time.
   *
   * @param date date
   * @param separator true to include separator '-', otherwise none used.
   *
   * @returns a date in format YYYY-MM-DD HH:MM or YYYYMMDDHHMM.
   */
  public static formatDate(date: Date, separator = true): string {
    // The formats are using fn-date, so not matching comments, but
    // as the comments pretty understandable, not going to change comment,
    // What 'k' stands for and difference between Y and y is just going to
    // confuse the caller.
    if (separator) {
      return formatDate(date, "yyyy-MM-dd kk:mm");
    } else {
      return formatDate(date, "yyyyMMddkkmm");
    }
  }

  /**
   * Get the data storage service.
   *
   * @returns the singleton of the storage service.
   */
  public static async getDatastoreService(): Promise<IExtensionDataManager> {
    if (this.SERVICE_DATA === undefined) {
      const dataService = await SDK.getService<IExtensionDataService>(
        CommonServiceIds.ExtensionDataService
      );
      const token = await SDK.getAccessToken();
      this.SERVICE_DATA = await dataService.getExtensionDataManager(
        SDK.getExtensionContext().id,
        token
      );
    }

    return this.SERVICE_DATA;
  }

  /**
   * Get the project service.
   *
   * @returns the singleton of the project service.
   */
  public static async getProjectService(): Promise<IProjectPageService> {
    if (this.SERVICE_PROJECT === undefined) {
      this.SERVICE_PROJECT = await SDK.getService<IProjectPageService>(
        CommonServiceIds.ProjectPageService
      );
    }

    return this.SERVICE_PROJECT;
  }

  /**
   * Get the location service.
   *
   * @returns the singleton of the location service.
   */
  public static async getLocationService(): Promise<ILocationService> {
    if (this.SERVICE_LOCATION === undefined) {
      this.SERVICE_LOCATION = await SDK.getService<ILocationService>(
        CommonServiceIds.LocationService
      );
    }

    return this.SERVICE_LOCATION;
  }

  /**
   * Get the base url for this project
   */
  public static async getBaseUrl(): Promise<string> {
    if (this.BASE_URL === undefined) {
      const locationService = await this.getLocationService();
      const orgUrl = await locationService.getServiceLocation();
      const projectName = await this.getProjectName();
      this.BASE_URL = orgUrl + projectName;
    }
    return this.BASE_URL;
  }

  /**
   * Get the current project name.
   *
   * @returns the current project name.
   */
  static async getProjectName(): Promise<string> {
    const projectInfo = await this.getProject();

    if (projectInfo) {
      return projectInfo.name;
    }

    throw Error("Unable to get project info");
  }

  /**
   * Get the project information which provides access to the current project associated to this page.
   *
   * @returns the project or undefined if not found.
   */
  static async getProject(): Promise<IProjectInfo | undefined> {
    const projectService = await this.getProjectService();
    return projectService.getProject();
  }

  /**
   * Given the current update, check if the update was a state change. If state changed, then
   * see if we need to update the parent.
   *
   * @param witApiClient API client that is fully configured.
   * @param parent the parent ID
   * @param id the updated work item id
   * @param changedDate the work item last changed date
   * @param stateChangedDate the work item last state changed date
   * @param state the work item's state
   */
  static async validateAndUpdateParents(
    witApiClient: WorkItemTrackingRestClient,
    parent: number,
    id: number,
    changedDate: Date,
    stateChangedDate: Date,
    state: string
  ): Promise<void> {
    if (stateChangedDate.getTime() !== changedDate.getTime()) {
      return;
    }

    if (
      (state !== Constants.WIT_STATE_IN_PROGRESS &&
        state != Constants.WIT_STATE_DONE) ||
      parent === undefined ||
      parent === null
    ) {
      // Ignoring all state changes outside of in progress and done.
      // Ignoring PBI with no parents.
      return;
    }

    if (state === Constants.WIT_STATE_IN_PROGRESS) {
      // Execute the update start dates only.
      await ProjectUtils.updateParents(
        witApiClient,
        parent,
        stateChangedDate,
        undefined
      );
    } else if (state === Constants.WIT_STATE_DONE) {
      // Execute the update finish dates only.
      await ProjectUtils.updateParents(
        witApiClient,
        parent,
        undefined,
        stateChangedDate
      );
    }
  }

  /**
   * Given the current update, check if the update was a state change. If state changed, then
   * see if we need to update the parent.
   *
   * **Note**: Iterative function.
   *
   * @param witApiClient API client that is fully configured.
   * @param parent the parent ID
   * @param startDate the work item when it moved to In Progress.
   * @param finishDate the work item when it moved to Done.
   */
  private static async updateParents(
    witApiClient: WorkItemTrackingRestClient,
    parent: number,
    startDate?: Date,
    finishDate?: Date
  ): Promise<void> {
    const parentWit = await witApiClient.getWorkItem(parent, undefined, [
      Constants.WIT_FIELD_STATE,
      Constants.WIT_FIELD_START_DATE,
      Constants.WIT_FIELD_FINISH_DATE,
      Constants.WIT_FIELD_PARENT_ID
    ]);

    const parentStartDate: Date =
      parentWit.fields[Constants.WIT_FIELD_START_DATE];
    const parentFinishDate: Date =
      parentWit.fields[Constants.WIT_FIELD_START_DATE];
    const grandParentId = parentWit.fields[Constants.WIT_FIELD_PARENT_ID];

    if (startDate) {
      if (
        parentStartDate == null ||
        parentStartDate == undefined ||
        parentStartDate.getTime() > startDate.getTime()
      ) {
        console.log("Update " + parent + " start date to " + startDate);
      }
    }

    if (finishDate) {
      if (
        parentFinishDate != null &&
        parentFinishDate != undefined &&
        parentFinishDate.getTime() < finishDate.getTime()
      ) {
        console.log("Update " + parent + " finish date to " + finishDate);
      }
    }

    if (grandParentId) {
      await ProjectUtils.updateParents(
        witApiClient,
        grandParentId,
        startDate,
        finishDate
      );
    }
  }
}
