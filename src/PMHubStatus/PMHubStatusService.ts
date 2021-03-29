// Library level
import { QueryType } from "azure-devops-extension-api/WorkItemTracking";

// Project level
import { Constants } from "../common/Constants";
import { Impediments } from "./Impediments";
import { PMHubStatusConfiguration } from "./Configuration";
import { PMStatusDocument } from "./PMStatusRecord";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectUtils } from "../common/ProjectUtils";
import { SearchResultTreeNode } from "../common/SearchResultTreeNode";
import { SearchUtils } from "../common/SearchUtils";

/**
 * Project status service page.
 */
export class PMHubStatusService {
  private static COLLECTION_ID = "status-report";

  /**
   * Get a list of records.
   *
   * @returns a list of status records.
   */
  public static async getListOfRecords(): Promise<PMStatusDocument[]> {
    const dataService = await ProjectUtils.getDatastoreService();
    const result = (await dataService.getDocuments(this.COLLECTION_ID, {
      defaultValue: []
    })) as PMStatusDocument[];

    return result;
  }

  /**
   * Delete all records.
   */
  public static async deleteAllRecords(): Promise<void> {
    const records = await this.getListOfRecords();
    const dataService = await ProjectUtils.getDatastoreService();

    for (let r of records) {
      if (r.id) {
        await dataService.deleteDocument(this.COLLECTION_ID, r.id);
      }
    }
  }

  /**
   * Delete a record.
   *
   * @param record the record to delete.
   */
  public static async deleteRecord(record: PMStatusDocument): Promise<void> {
    const dataService = await ProjectUtils.getDatastoreService();
    if (record && record.id) {
      await dataService.deleteDocument(this.COLLECTION_ID, record.id);
    }
  }

  /**
   * Save the current data on the status page.
   *
   * @param record the current data of the page.
   * @returns the updated record (Does not change the original)
   */
  public static async saveRecord(
    record: PMStatusDocument
  ): Promise<PMStatusDocument> {
    const dataService = await ProjectUtils.getDatastoreService();

    if (record.id) {
      // Update.
      record = await dataService.updateDocument(this.COLLECTION_ID, record);
    } else {
      // Create.
      if (record.asOf) {
        record.name = ProjectUtils.formatDate(record.asOf);
        record.id = ProjectUtils.formatDate(record.asOf, false);
        record.id = record.asOf.getTime().toString();
      }

      record = await dataService.createDocument(this.COLLECTION_ID, record);
    }

    return record;
  }

  /**
   * Group the results by configuration first and if not configured, then use the search results as a grouping.
   *
   * Group logic is as follows:
   * 1. Look at configuration to see how to group
   * 2. Look to see if search query is a tree result type and if so, use top nodes as group
   * 3. Finally, use area path as grouping.
   *
   * @param currentStatus the current status report.
   */
  public static groupResultData(
    currentStatus: SearchResultTreeNode<ProjectStatus, number>
  ): Map<string, SearchResultTreeNode<ProjectStatus, number>[]> {
    const reportGrouping = PMHubStatusConfiguration.getStatusReportGrouping();

    if (
      reportGrouping.startsWith(
        PMHubStatusConfiguration.STATUS_REPORT_GROUPING_PREFIX_BY_FIELD
      )
    ) {
      // Configuration - Mode 1 (see function description)
      const fieldName = reportGrouping.substring(
        PMHubStatusConfiguration.STATUS_REPORT_GROUPING_PREFIX_BY_FIELD.length
      );

      if (currentStatus.sourceQuery?.queryType === QueryType.OneHop) {
        return this.groupResultDataByFieldWhenTree(currentStatus, fieldName);
      } else if (currentStatus.sourceQuery?.queryType === QueryType.Flat) {
        return this.groupResultDataByFieldWhenFlat(currentStatus, fieldName);
      }
    } else if (
      // Configuration - Mode 2 (see function description)
      reportGrouping === PMHubStatusConfiguration.STATUS_REPORT_GROUPING_QUERY
    ) {
      if (currentStatus.sourceQuery?.queryType === QueryType.OneHop) {
        return this.groupResultDataByTopNodes(currentStatus);
      }
    }

    // Default.
    return this.groupResultDataByFieldWhenFlat(
      currentStatus,
      Constants.WIT_FIELD_AREA_PATH
    );
  }

  /**
   * Get the top level field path as that what we care for.
   *
   * @param areaPath the area path
   */
  private static getTopLevelAreaPath(areaPath: string): string {
    if (areaPath === undefined || areaPath.length === 0) {
      return "";
    }

    let slashIndex = areaPath.indexOf("\\");

    if (slashIndex >= 0) {
      areaPath = areaPath.substring(slashIndex + 1);
      slashIndex = areaPath.indexOf("\\");

      if (slashIndex >= 0) {
        areaPath = areaPath.substring(0, slashIndex);
      }
    }

    return areaPath;
  }

  /**
   * Helper method for grouping by field name.
   *
   * @param children the current children being iterated.
   * @param grouping the grouping
   * @param fieldName the field name
   */
  private static groupResultDataByFieldHelper(
    children: SearchResultTreeNode<ProjectStatus, number>[],
    grouping: Map<string, SearchResultTreeNode<ProjectStatus, number>[]>,
    fieldName: string
  ): void {
    let fieldValue;
    let dataArray: SearchResultTreeNode<ProjectStatus, number>[] | undefined;

    for (let child of children) {
      fieldValue = child.data?.sourceWorkItem?.fields[fieldName];
      if (fieldValue) {
        if (fieldName === Constants.WIT_FIELD_AREA_PATH) {
          fieldValue = this.getTopLevelAreaPath(fieldValue);
        }
        dataArray = grouping.get(fieldValue);

        if (dataArray === undefined) {
          dataArray = [];
          grouping.set(fieldValue, dataArray);
        }

        dataArray.push(child);
      }
    }
  }

  /**
   * Group the data by the child nodes based on a field.
   *
   * @param currentStatus the current status report.
   * @param fieldName the field name
   */
  private static groupResultDataByFieldWhenFlat(
    currentStatus: SearchResultTreeNode<ProjectStatus, number>,
    fieldName: string
  ): Map<string, SearchResultTreeNode<ProjectStatus, number>[]> {
    const grouping: Map<
      string,
      SearchResultTreeNode<ProjectStatus, number>[]
    > = new Map();

    this.groupResultDataByFieldHelper(
      currentStatus.children,
      grouping,
      fieldName
    );
    return grouping;
  }

  /**
   * Group the data by the child nodes based on a field.
   *
   * @param currentStatus the current status report.
   * @param fieldName the field name
   */
  private static groupResultDataByFieldWhenTree(
    currentStatus: SearchResultTreeNode<ProjectStatus, number>,
    fieldName: string
  ): Map<string, SearchResultTreeNode<ProjectStatus, number>[]> {
    const grouping: Map<
      string,
      SearchResultTreeNode<ProjectStatus, number>[]
    > = new Map();

    for (let node of currentStatus.children) {
      if (node.data) {
        this.groupResultDataByFieldHelper(node.children, grouping, fieldName);
      }
    }

    return grouping;
  }

  /**
   * Group the data by the top level nodes.
   *
   * @param currentStatus the current status report.
   */
  private static groupResultDataByTopNodes(
    currentStatus: SearchResultTreeNode<ProjectStatus, number>
  ): Map<string, SearchResultTreeNode<ProjectStatus, number>[]> {
    const grouping: Map<
      string,
      SearchResultTreeNode<ProjectStatus, number>[]
    > = new Map();
    let dataArray: SearchResultTreeNode<ProjectStatus, number>[];

    for (let node of currentStatus.children) {
      if (node.data) {
        dataArray = [];
        grouping.set(node.data.title, dataArray);

        for (let child of node.children) {
          dataArray.push(child);
        }
      }
    }

    return grouping;
  }

  /**
   * Populate the impediments for all projects referenced.
   *
   * @param currentStatus the current status.
   */
  private static async populateImpediments(
    currentStatus: SearchResultTreeNode<ProjectStatus, number>
  ): Promise<void> {
    const nodeMap = currentStatus.nodeMap;

    if (nodeMap === undefined) {
      throw new Error("Node map should not by empty.");
    }

    // Get the list of impediments.
    const impedimentsResults: SearchResultTreeNode<
      Impediments,
      number
    > = await SearchUtils.executeQuery(
      PMHubStatusConfiguration.getQueryImpediments(),
      Impediments
    );
    let relatedId: number;
    let relatedNode: SearchResultTreeNode<ProjectStatus, number> | undefined;

    for (let node of impedimentsResults.children) {
      if (node === undefined || node.data === undefined) {
        continue;
      }

      // Parent is either a feature or epic and child is the impediment itself.
      if (node.data.type === Constants.WIT_TYPE_EPIC) {
        relatedId = node.data.id;
      } else if (node.data.type === Constants.WIT_TYPE_FEATURE) {
        relatedId = node.data.parent;
      } else {
        continue;
      }

      relatedNode = nodeMap.get(relatedId);

      if (relatedNode && relatedNode.data) {
        // Go down a level as impediment is there.
        if (node.children[0].data) {
          // We have an impediment mapped to a project.
          relatedNode.data.addImpediment(node.children[0].data.title);
        }
      }
    }
  }

  /**
   * Get the latest project status.
   *
   * @returns the latest project statues.
   */
  static async getLatestProjectStatuses(): Promise<
    SearchResultTreeNode<ProjectStatus, number>
  > {
    return this.getProjectStatus();
  }

  /**
   * Get the latest project status.
   *
   * @param asOf the date or undefined to get latest.
   */
  static async getProjectStatus(
    asOf?: Date
  ): Promise<SearchResultTreeNode<ProjectStatus, number>> {
    const projectStatus: SearchResultTreeNode<
      ProjectStatus,
      number
    > = await SearchUtils.executeQuery(
      PMHubStatusConfiguration.getQueryForLatestStatus(),
      ProjectStatus,
      asOf
    );

    if (!projectStatus.isEmpty()) {
      await PMHubStatusService.populateImpediments(projectStatus);
    }

    return projectStatus;
  }
}
