// Library level
import { QueryType } from "azure-devops-extension-api/WorkItemTracking";

// Project level
import { Constants } from "../Common/Constants";
import { ImpedimentsEntity } from "./Impediments.entity";
import { StatusReportConfig } from "./StatusReport.config";
import { StatusReportEntity } from "./StatusReport.entity";
import { StatusEntryEntity } from "./StatusEntry.entity";
import { ProjectService } from "../Common/Project.service";
import { SearchResultEntity } from "../Search/SearchResult.entity";
import { SearchService } from "../Search/Search.service";
import { StatusReportRepository } from "./StatusReport.repository";

/**
 * Project status service page.
 */
export class StatusReportService {
  /**
   * The latest report record.
   */
  public static readonly LATEST_RECORD: StatusReportEntity = {
    id: "Latest",
    asOf: undefined,
    name: "Latest"
  };

  /**
   * Get a list of records.
   *
   * @param sortDesc returns results in descendig order, otherwise ascending.
   * @returns a list of status records.
   */
  public static async getListOfRecords(
    sortDesc = true
  ): Promise<StatusReportEntity[]> {
    const recordList = await StatusReportRepository.getListOfRecords(sortDesc);
    return recordList;
  }

  /**
   * Delete all records.
   */
  public static async deleteAllRecords(): Promise<void> {
    await StatusReportRepository.deleteAllRecords();
  }

  /**
   * Delete a record.
   *
   * @param record the record to delete with the id field spsecified.
   */
  public static async deleteRecord(record: StatusReportEntity): Promise<void> {
    if (record && record.id) {
      await StatusReportRepository.deleteRecord(record);
    } else {
      throw new Error("Cannot delete a record that doesn't even exist.");
    }
  }

  /**
   * Save the current data on the status page.
   *
   * @param record the current data of the page.
   * @returns the updated record (Does not change the original)
   */
  public static async saveRecord(
    record: StatusReportEntity
  ): Promise<StatusReportEntity> {
    if (record.id && record.id !== StatusReportService.LATEST_RECORD.id) {
      // Update.
      record = await StatusReportRepository.updateRecord(record);
    } else if (record.asOf) {
      // Create.
      const newRecord = new StatusReportEntity();
      newRecord.asOf = record.asOf;
      newRecord.name = ProjectService.formatDate(record.asOf);
      newRecord.id = record.asOf.getTime().toString();
      record = await StatusReportRepository.createRecord(newRecord);
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
    currentStatus: SearchResultEntity<StatusEntryEntity, number>
  ): Map<string, SearchResultEntity<StatusEntryEntity, number>[]> {
    const reportGrouping = StatusReportConfig.getStatusReportGrouping();

    if (
      reportGrouping.startsWith(
        StatusReportConfig.STATUS_REPORT_GROUPING_PREFIX_BY_FIELD
      )
    ) {
      // Configuration - Mode 1 (see function description)
      const fieldName = reportGrouping.substring(
        StatusReportConfig.STATUS_REPORT_GROUPING_PREFIX_BY_FIELD.length
      );

      if (currentStatus.sourceQuery?.queryType === QueryType.OneHop) {
        return this.groupResultDataByFieldWhenTree(currentStatus, fieldName);
      } else if (currentStatus.sourceQuery?.queryType === QueryType.Flat) {
        return this.groupResultDataByFieldWhenFlat(currentStatus, fieldName);
      }
    } else if (
      // Configuration - Mode 2 (see function description)
      reportGrouping === StatusReportConfig.STATUS_REPORT_GROUPING_QUERY
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
    children: SearchResultEntity<StatusEntryEntity, number>[],
    grouping: Map<string, SearchResultEntity<StatusEntryEntity, number>[]>,
    fieldName: string
  ): void {
    let fieldValue;
    let dataArray: SearchResultEntity<StatusEntryEntity, number>[] | undefined;

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
    currentStatus: SearchResultEntity<StatusEntryEntity, number>,
    fieldName: string
  ): Map<string, SearchResultEntity<StatusEntryEntity, number>[]> {
    const grouping: Map<
      string,
      SearchResultEntity<StatusEntryEntity, number>[]
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
    currentStatus: SearchResultEntity<StatusEntryEntity, number>,
    fieldName: string
  ): Map<string, SearchResultEntity<StatusEntryEntity, number>[]> {
    const grouping: Map<
      string,
      SearchResultEntity<StatusEntryEntity, number>[]
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
    currentStatus: SearchResultEntity<StatusEntryEntity, number>
  ): Map<string, SearchResultEntity<StatusEntryEntity, number>[]> {
    const grouping: Map<
      string,
      SearchResultEntity<StatusEntryEntity, number>[]
    > = new Map();
    let dataArray: SearchResultEntity<StatusEntryEntity, number>[];

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
    currentStatus: SearchResultEntity<StatusEntryEntity, number>
  ): Promise<void> {
    const nodeMap = currentStatus.nodeMap;

    if (nodeMap === undefined) {
      throw new Error("Node map should not by empty.");
    }

    // Get the list of impediments.
    const impedimentsResults: SearchResultEntity<
      ImpedimentsEntity,
      number
    > = await SearchService.executeQuery(
      StatusReportConfig.getQueryImpediments(),
      ImpedimentsEntity
    );
    let relatedId: number;
    let relatedNode: SearchResultEntity<StatusEntryEntity, number> | undefined;

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
          relatedNode.data.addImpediment(node.children[0].data);
          console.log(node.children[0].data);
        }
      }
    }
  }

  /**
   * Get the latest project status.
   *
   * @param asOf the date or undefined to get latest.
   */
  static async getProjectStatus(
    asOf?: Date
  ): Promise<SearchResultEntity<StatusEntryEntity, number>> {
    const projectStatus: SearchResultEntity<
      StatusEntryEntity,
      number
    > = await SearchService.executeQuery(
      StatusReportConfig.getQueryForLatestStatus(),
      StatusEntryEntity,
      asOf
    );

    if (!projectStatus.isEmpty()) {
      await StatusReportService.populateImpediments(projectStatus);
    }

    return projectStatus;
  }
}
