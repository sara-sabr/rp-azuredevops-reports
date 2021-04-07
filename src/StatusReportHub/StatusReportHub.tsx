import "./StatusReportHub.scss";

// Library Level
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { Dropdown } from "azure-devops-ui/Dropdown";
import {
  CustomHeader,
  HeaderDescription,
  HeaderTitle,
  HeaderTitleArea,
  HeaderTitleRow,
  TitleSize
} from "azure-devops-ui/Header";
import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import { Link } from "azure-devops-ui/Link";
import { IListBoxItem, ListBoxItemType } from "azure-devops-ui/ListBox";
import { Observer } from "azure-devops-ui/Observer";
import { Page } from "azure-devops-ui/Page";
import { Pill } from "azure-devops-ui/Pill";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import {
  IStatusProps,
  Status,
  StatusSize,
  Statuses
} from "azure-devops-ui/Status";
import { ZeroData } from "azure-devops-ui/ZeroData";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";

// Project Level
import { Constants } from "../Common/Constants";
import { IStatusReportHubState } from "./IStatusReportHub.state";
import { StatusEntryEntity } from "./StatusEntry.entity";
import { ProjectService } from "../Common/Project.service";
import { SearchResultEntity } from "../Search/SearchResult.entity";
import { StatusReportService } from "./StatusReport.service";
import { StatusReportEntity } from "./StatusReport.entity";
import { StatusReportCommandMenu } from "./StatusReportCommandMenu.ui";

/**
 * The status report page.
 */
class StatusReportHub extends React.Component<{}, IStatusReportHubState> {
  /**
   * The status report dropdown selected
   */
  private statusReportSelection = new DropdownSelection();

  /**
   * Row Number of entries
   */
  private rowNumber: number = 1;

  /**
   * Menu Buttons.
   */
  private commandButtons: StatusReportCommandMenu;

  /**
   * State object being referenced.
   *
   * Note: You will need to call refreshState() in order for it to
   * reflect in react though as we want to control when the state changes
   * are fired.
   */
  private statusPageHub: IStatusReportHubState;

  /**
   * The list of reports saved. (This is using observer pattern)
   */
  private savedReportArray = new ObservableValue<IListBoxItem[]>([]);

  /**
   * Work item URL prefix
   */
  private witItemUrlPrefix: string = "";

  constructor(props: {}) {
    super(props);
    this.statusPageHub = {
      record: StatusReportService.LATEST_RECORD,
      statusReport: undefined
    };
    this.commandButtons = new StatusReportCommandMenu();
    this.state = this.statusPageHub;
    this.initEvents();
    this.getEditUrl();
  }

  /**
   * Attach the events.
   */
  private initEvents(): void {
    // This is required due to JS closures.
    const self = this;

    // Save Event
    this.commandButtons.attachOnSaveActivate(() => {
      self.eventHanlderSaveButton();
    });

    // Delete event
    this.commandButtons.attachOnDeleteActivate(() => {
      self.eventHandlerDeleteButton();
    });

    // Delete event
    this.commandButtons.attachOnRefreshActivate(() => {
      self.showInProgress();
      self.loadRecord();
    });
  }

  /**
   * @inheritdoc
   *
   * Note: This is essentially called as part of react lifecycle.
   * https://reactjs.org/docs/state-and-lifecycle.html
   */
  public componentDidMount() {
    this.performMountAsync();
  }

  /**
   * Mount activiites that are async.
   */
  private async performMountAsync():Promise<void> {
    await SDK.init();
    this.statusPageHub.userDisplayName = ProjectService.getCurrentUserDisplayName();
    await this.refreshSavedReports();
    await this.loadLatestRecord();
  }

  /**
   * Save button pressed, so save the record.
   */
  public async eventHanlderSaveButton(): Promise<void> {
    if (this.state.record) {
      this.showInProgress();

      // Start the saving.
      const record = await StatusReportService.saveRecord(this.state.record);
      await this.refreshSavedReports();
      this.statusPageHub.record = record;
      this.refreshState();

      // Always reload what we have after every save.
      this.selectReport(record.id);
      await this.loadRecord();
    }

    await this.commandButtons.updateButtonStatuses(this.state);
  }

  /**
   * Delete button pressed, so delete the record and refresh with latest.
   */
  public async eventHandlerDeleteButton(): Promise<void> {
    if (this.state.record) {
      this.showInProgress();

      await StatusReportService.deleteRecord(this.state.record);
      // Load the record first, otherwise the selection is out of sync as the
      // index selected is higher then what could be available.
      // Ex: When you delete the last remaining status report.
      await this.loadLatestRecord();
      await this.refreshSavedReports();
    }
  }

  /**
   * Handle the selection event when a status report is chosen.
   *
   * @param event the event that happened
   * @param item the item selected
   */
  public eventHandlerStatusReportSelection(
    event: React.SyntheticEvent<HTMLElement>,
    item: IListBoxItem
  ): void {
    if (item.data) {
      this.showInProgress();
      this.statusPageHub.record = item.data as StatusReportEntity;
      this.loadRecord();
    }
  }

  private async getEditUrl(): Promise<void> {
    this.witItemUrlPrefix = await ProjectService.generateWitEditUrl("");
  }

  /**
   * Bring up the inprogress.
   */
  private showInProgress(): void {
    this.statusPageHub.statusReport = undefined;
    this.refreshState();
  }

  /**
   * Refresh the saved report this.
   */
  private async refreshSavedReports(): Promise<void> {
    const savedReports = await StatusReportService.getListOfRecords();
    this.savedReportArray.value = this.generateReportList(savedReports);
  }

  /**
   * Loads a record based upon the current record in the state.
   */
  private async loadRecord(): Promise<void> {
    if (this.statusPageHub.record === undefined) {
      return;
    }

    const asOf = this.statusPageHub.record.asOf;
    const projectStatusData = await StatusReportService.getProjectStatus(asOf);
    this.statusPageHub.record.asOf = projectStatusData.asOf;
    this.populateRecordInfo(projectStatusData, this.statusPageHub.record);
    this.selectReport(this.statusPageHub.record.id);
    await this.commandButtons.updateButtonStatuses(this.state);
  }

  /**
   * Load the latest record into the page.
   */
  private async loadLatestRecord(): Promise<void> {
    this.statusPageHub.record = StatusReportService.LATEST_RECORD;
    await this.loadRecord();
  }

  /**
   * Select the current report represented on this page.
   *
   * @param id the id to select
   */
  private selectReport(id: string | undefined): void {
    if (id === undefined) {
      return;
    }

    const currentValues = this.savedReportArray.value;

    for (let idx = 0; idx < currentValues.length; idx++) {
      if (currentValues[idx].id === id) {
        this.statusReportSelection.select(idx);
        break;
      }
    }
  }

  /**
   * Populate the page based on record loaded.
   *
   * @param statusData the status date
   * @param statusDocument the status document.
   */
  private populateRecordInfo(
    statusData: SearchResultEntity<StatusEntryEntity, number>,
    statusDocument: StatusReportEntity
  ): void {
    this.statusPageHub.currentSourceQuery = statusData.sourceQuery;
    this.statusPageHub.statusReport = StatusReportService.groupResultData(
      statusData
    );
    this.statusPageHub.currentSourceQuery = statusData.sourceQuery;
    this.statusPageHub.record = statusDocument;
    this.refreshState();

    this.commandButtons.updateButtonStatuses(this.state);
    this.rowNumber = 1;
  }

  /**
   * Refresh the data with the backing object.
   */
  private refreshState(): void {
    this.setState(this.statusPageHub);
  }

  /**
   * Write out the status node.
   *
   * @param projectStatusNode the node to write
   */
  private writeStatusRow(
    projectStatusNode: SearchResultEntity<StatusEntryEntity, number>
  ): JSX.Element {
    const rowData: StatusEntryEntity | undefined = projectStatusNode.data;

    if (rowData === undefined) {
      return (
        <tr>
          <td>No Data</td>
        </tr>
      );
    }
    return (
      <tr key={rowData.id} className="status-report-entry-row">
        {
          /** Epic - Risk Level */
          <td className="status-report-col-status">
            {this.writeColumnRisk(rowData.riskLevel, rowData.id)}
          </td>
        }
        {
          /** Epic - Date  */
          <td>
            {rowData.targetDate && (
              <span>
                {ProjectService.formatDateWithNoTime(rowData.targetDate)}
              </span>
            )}
          </td>
        }
        {
          /** Epic - Description  */
          <td>
            <Pill
              className="margin-top-4 activityTitle margin-bottom-4"
              excludeFocusZone={true}
              excludeTabStop={true}
            >
              <Link href={this.witItemUrlPrefix + rowData.id} target="_blank">
                #{rowData.id}
              </Link>
              : {rowData.title}
            </Pill>
            <p>
              <b>Objective</b>
            </p>
            <p dangerouslySetInnerHTML={{ __html: rowData.objective }}></p>
            <p>
              <b>Action/Status</b>: {rowData.status}
            </p>
            <p dangerouslySetInnerHTML={{ __html: rowData.action }}></p>
            <p>
              <b>Issues</b>: {rowData.keyIssues.length === 0 && "No issues"}
            </p>
            {rowData.keyIssues.length > 0 && (
              <ul>
                {rowData.keyIssues.map(value => {
                  return (
                    <li key={value.id}>
                      <Link
                        href={this.witItemUrlPrefix + value.id}
                        target="_blank"
                      >
                        #{value.id}
                      </Link>
                      : {value.title}
                    </li>
                  );
                })}
              </ul>
            )}
          </td>
        }
      </tr>
    );
  }

  /**
   * Write the group.
   *
   * @param groupTitle the group title
   */
  private writeGroup(groupTitle: string): JSX.Element {
    return (
      <tbody key={groupTitle}>
        <tr className="status-report-grouped-header-row">
          <th colSpan={3}>{groupTitle}</th>
        </tr>
        {this.state.statusReport?.get(groupTitle)?.map(value => {
          return this.writeStatusRow(value);
        })}
      </tbody>
    );
  }

  /**
   * Write the risk column.
   *
   * @param riskLevel risk level
   * @param id the wit ID
   */
  private writeColumnRisk(
    riskLevel: string | undefined,
    id: number
  ): JSX.Element {
    let statusProp: IStatusProps;
    let statusText: string;

    if (riskLevel === Constants.WIT_RISK_HIGH) {
      statusProp = Statuses.Failed;
      statusText = "High";
    } else if (riskLevel === Constants.WIT_RISK_MED) {
      statusProp = Statuses.Warning;
      statusText = "Medium";
    } else {
      statusProp = Statuses.Success;
      statusText = "Low";
    }

    return (
      <Status
        {...statusProp}
        key={id + ".status"}
        size={StatusSize.l}
        className="flex-self-center"
        ariaLabel={statusText}
      />
    );
  }

  /**
   * Produce the list of items
   *
   * @parms savedDocuments an array of saved documents.
   * @returns a list based off saved documents and pre-appended latest.
   */
  private generateReportList(
    savedDocuments?: StatusReportEntity[]
  ): IListBoxItem[] {
    const itemList: IListBoxItem[] = [
      {
        // Add the latest
        id: StatusReportService.LATEST_RECORD.id as string,
        text: StatusReportService.LATEST_RECORD.name,
        data: StatusReportService.LATEST_RECORD
      },
      {
        // Divider
        id: "divider",
        type: ListBoxItemType.Divider
      }
    ];

    if (savedDocuments && savedDocuments.length > 0) {
      itemList.push({
        id: "Saved Reports",
        type: ListBoxItemType.Header,
        text: "Saved Reports"
      });

      for (const report of savedDocuments) {
        itemList.push({
          id: report.id as string,
          text: report.name,
          data: report
        });
      }
    }

    return itemList;
  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow" key="statusPage">
        <CustomHeader className="bolt-header-with-commandbar">
          <HeaderTitleArea>
            <HeaderTitleRow>
              <HeaderTitle
                className="text-ellipsis"
                titleSize={TitleSize.Large}
              >
                Status Reports
              </HeaderTitle>
            </HeaderTitleRow>
            <HeaderDescription>
              <Observer items={this.savedReportArray}>
                <Dropdown
                  ariaLabel="Report Date"
                  placeholder="Select a report"
                  showFilterBox={true}
                  items={[]}
                  selection={this.statusReportSelection}
                  onSelect={this.eventHandlerStatusReportSelection.bind(this)}
                />
              </Observer>
            </HeaderDescription>
          </HeaderTitleArea>
          <Observer items={this.commandButtons.buttons}>
            <HeaderCommandBar items={this.commandButtons.buttons.value} />
          </Observer>
        </CustomHeader>
        <div className="page-content-left page-content-right page-content-top">
          {/** Page header only for printing */}
          <div className="flex-row padding-vertical-4 only-on-print title-m">
            <div className="flex-column" style={{width: "48%"}}>Report: {this.state.record?.name}</div>
            <div className="flex-column" style={{width: "48%", textAlign: "right"}}>User: {this.state.userDisplayName}</div>
          </div>
          {/** Status Report Table */}
          <table className="status-report-tables" id="statusReport">
            <thead>
              <tr className="status-report-header-row">
                <th className="status-report-col-status">Risk</th>
                <th className="status-report-col-estimate-date">
                  Estimated Due Date
                </th>
                <th className="status-report-col-details">Details</th>
              </tr>
            </thead>
            {/** Print this on no data. */
            this.state.statusReport === undefined && (
              <tbody>
                <tr>
                  <td colSpan={3}>
                    <div className="flex-row v-align-middle justify-center full-size">
                      <Spinner
                        size={SpinnerSize.large}
                        label="Please wait ..."
                      />
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
            {/** Status report with no data found. */
            this.state.statusReport !== undefined &&
              this.state.statusReport.size === 0 && (
                <tbody>
                  <tr>
                    <td colSpan={3}>
                      <ZeroData
                        className="flex-row v-align-middle justify-center full-size"
                        primaryText="No data found for this report."
                        secondaryText={
                          <div>
                            <p>
                              Please ensure the{" "}
                              <Link href={this.state.queryUrl} target={"_top"}>
                                {this.state.currentSourceQuery?.name}
                              </Link>{" "}
                              query actually produces a result.
                            </p>
                          </div>
                        }
                        imageAltText="No Data Image"
                        imagePath="https://cdn.vsassets.io/v/M183_20210324.1/_content/Illustrations/general-no-results-found.svg"
                      />
                    </td>
                  </tr>
                </tbody>
              )}

            {/** Status report with data populated. */
            this.state.statusReport !== undefined &&
              this.state.statusReport.size >= 0 &&
              [...this.state.statusReport].map(entry => {
                return this.writeGroup(entry[0]);
              })}
          </table>
        </div>
      </Page>
    );
  }
}

ReactDOM.render(<StatusReportHub />, document.getElementById("root"));
