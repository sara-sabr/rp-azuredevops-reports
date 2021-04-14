// Libraries
import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  IExtensionDataManager,
  IExtensionDataService,
  ILocationService,
  IProjectInfo,
  IProjectPageService
} from "azure-devops-extension-api";

// Function Import
import { format as formatDate } from "date-fns";

/**
 * Project utilities.
 */
export class ProjectService {
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
   * Work item prepend.
   */
  private static prependWitEditUrl = "/_workitems/edit/";

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
   * Generate the URL to edit a work item.
   *
   * @param id the id of the work item.
   */
  public static async generateWitEditUrl(id: string | number): Promise<string> {
    const baseUrl = await this.getBaseUrl();
    return baseUrl + this.prependWitEditUrl + id;
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
   * Get the current user's display name as saved in Azure DevOps.
   *
   * @returns the current user's display name.
   */
  static getCurrentUserDisplayName():string {
    return SDK.getUser().displayName;
  }
}
