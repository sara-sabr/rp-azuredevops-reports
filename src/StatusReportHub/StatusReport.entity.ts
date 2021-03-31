/**
 * The record being saved into Azure Boards.
 */
export class StatusReportEntity {
  /**
   * The document ID.
   */
  id: string | undefined;

  /**
   * The name of the status report.
   */
  name: string = "";

  /**
   * Is the status report approved?
   */
  approved: boolean = true;

  /**
   * Date of when the status report data was produced.
   */
  asOf: Date | undefined;
}
