// Project level
import { ProjectService, to } from "@esdc-it-rp/azuredevops-common";
import { StatusReportEntity } from "./StatusReport.entity";

/**
 * All data save/load happens in the repository.
 */
export class StatusReportRepository {
  private static COLLECTION_ID = "status-report";

  /**
   * Get a list of records.
   *
   * @param sortDesc returns results in descendig order, otherwise ascending.
   * @returns a list of status records.
   */
  public static async getListOfRecords(
    sortDesc = true
  ): Promise<StatusReportEntity[]> {
    const dataService = await ProjectService.getDatastoreService();
    try {
      const [error, result] = (await to(
        dataService.getDocuments(this.COLLECTION_ID, {
          defaultValue: [],
        })
      )) as [Error, StatusReportEntity[] | undefined];

      if (error === null && result) {
        const compareValue = sortDesc ? 1 : -1;

        // In place sort.
        result.sort((a, b): number => {
          if (a.name < b.name) {
            return compareValue;
          } else if (a.name > b.name) {
            return compareValue * -1;
          }
          return 0;
        });

        return result;
      }

      // If 404, just provide empty as that happens when no collections already exist.
      // Example, no saves every done by this extension.
      //
      return [];
    } catch (e) {
      // Happens when first load as no records exist.
      return [];
    }
  }

  /**
   * Delete all records.
   */
  public static async deleteAllRecords(): Promise<void> {
    const records = await this.getListOfRecords();
    const dataService = await ProjectService.getDatastoreService();

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
  public static async deleteRecord(record: StatusReportEntity): Promise<void> {
    const dataService = await ProjectService.getDatastoreService();
    if (record && record.id) {
      await dataService.deleteDocument(this.COLLECTION_ID, record.id);
    }
  }

  /**
   * Update the record with new data.
   *
   * @param record the current data of the page.
   * @returns the updated record (Does not change the original)
   * @throws exception when not latest or does not exist.
   */
  public static async updateRecord(
    record: StatusReportEntity
  ): Promise<StatusReportEntity> {
    const dataService = await ProjectService.getDatastoreService();
    record = await dataService.updateDocument(this.COLLECTION_ID, record);
    return record;
  }

  /**
   * Create a new record.
   *
   * @param record the current data of the page.
   * @returns the updated record (Does not change the original)
   */
  public static async createRecord(
    record: StatusReportEntity
  ): Promise<StatusReportEntity> {
    const dataService = await ProjectService.getDatastoreService();
    record = await dataService.createDocument(this.COLLECTION_ID, record);
    return record;
  }
}
