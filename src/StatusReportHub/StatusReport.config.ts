// Project Level
import { Constants } from "../Common/Constants";
import { SearchService } from "../Search/Search.service";

/**
 * Looad the configurations required to display the status report page.
 *
 * Note: For now it is all fixed strings, however later this should be loaded
 */
export class StatusReportConfig {
  private static readonly STATUS_REPORT_FOLDER = "Status Report";

  /**
   * Prefix for grouping by field
   */
  public static readonly STATUS_REPORT_GROUPING_PREFIX_BY_FIELD = "field:";

  /**
   * Grouping by search hierachy.
   */
  public static readonly STATUS_REPORT_GROUPING_QUERY = "query";

  /**
   * Get the configuration for how the report will group entries.
   *
   * @returns the report grouping setting.
   */
  public static getStatusReportGrouping(): string {
    return (
      this.STATUS_REPORT_GROUPING_PREFIX_BY_FIELD +
      Constants.WIT_FIELD_AREA_PATH
    );
  }

  /**
   * Get the configuration for the latest status report.
   *
   * @returns the name of the query.
   */
  public static getQueryForLatestStatus(): string {
    return SearchService.buildQueryFQN(
      Constants.DEFAULT_QUERIES_SHARED_FOLDER,
      Constants.DEFAULT_QUERIES_EXTENSION_FOLDER,
      StatusReportConfig.STATUS_REPORT_FOLDER,
      "Latest Status Report"
    );
  }

  /**
   * Get the configuration for the impediments list.
   *
   * @returns the name of the query.
   */
  public static getQueryImpediments(): string {
    return SearchService.buildQueryFQN(
      Constants.DEFAULT_QUERIES_SHARED_FOLDER,
      Constants.DEFAULT_QUERIES_EXTENSION_FOLDER,
      StatusReportConfig.STATUS_REPORT_FOLDER,
      "Impediments"
    );
  }

  /**
   * Get the target field as specified by the configuration.
   *
   * @returns the field name for objetive.
   */
  public static getFieldTargetDate(): string {
    return Constants.WIT_FIELD_TARGET_DATE;
  }

  /**
   * Get the objective field as specified by the configuration.
   *
   * @returns the field name for objetive.
   */
  public static getFieldObjective(): string {
    return Constants.WIT_FIELD_DESCRIPTION;
  }

  /**
   * Get the risk field as specified by the configuration.
   *
   * @returns the field name for the risk.
   */
  public static getFieldRisk(): string {
    return Constants.WIT_FIELD_RISK;
  }

  /**
   * Get the action field as specified by the configuration.
   *
   * @returns the field name for the action.
   */
  public static getFieldAction(): string {
    return Constants.WIT_FIELD_ACTION;
  }

  /**
   * Get the title field as specified by the configuration.
   *
   * @returns the field name for the title.
   */
  public static getFieldTitle(): string {
    return Constants.WIT_FIELD_TITLE;
  }

  /**
   * Get the status field as specified by the configuration.
   *
   * @returns the field name for the status.
   */
  public static getFieldStatus(): string {
    return Constants.WIT_FIELD_STATE;
  }
}
