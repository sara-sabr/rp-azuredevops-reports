import "./PMHubStatus.scss";

// Library Level
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
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
import { GroupedItemProvider } from "azure-devops-ui/Utilities/GroupedItemProvider";

// Project Level
import { Constants } from "../common/Constants";
import { IPMHubStatusPage } from "./IPMHubStatusPage";
import { PMHubStatusService } from "./PMHubStatusService";
import { PMStatusDocument } from "./PMStatusRecord";
import { PMStatusMenu } from "./PMStatusMenu";
import { ProjectStatus } from "./ProjectStatus";
import { ProjectUtils } from "../common/ProjectUtils";
import { SearchResultTreeNode } from "../common/SearchResultTreeNode";
import { ObservableValue, ObservableArray } from "azure-devops-ui/Core/Observable";

/**
 * The status report page.
 */
class PMHubStatus extends React.Component<{}, IPMHubStatusPage> {
  private statusReportSelection = new DropdownSelection();
  private rowNumber: number = 1;
  private commandButtons: PMStatusMenu;
  private static LATEST_REPORT: string = "Latest";
  private pmHubStatusPage: IPMHubStatusPage;
  private savedReportArray = new ObservableValue<IListBoxItem[]>([]);

  constructor(props: {}) {
    super(props);
    this.pmHubStatusPage = {
      statusReport: undefined,
    };
    this.commandButtons = new PMStatusMenu();
    this.state = this.pmHubStatusPage;
    this.initEvents();
  }

  /**
   * Attach the events.
   */
  private initEvents(): void {
    let that = this;
    this.commandButtons.attachOnSaveActivate(() => {
      if (that.state.record) {
        PMHubStatusService.saveRecord(that.state.record);
        that.refreshSavedReports();
      }
    });
    this.commandButtons.attachOnDeleteActivate(() => {
      if (that.state.record) {
        PMHubStatusService.deleteRecord(that.state.record);
        that.refreshSavedReports();
      }
    });
  }

  public componentDidMount() {
    SDK.init();
    this.loadData();
    this.refreshSavedReports();
  }

  /**
   * Refresh the saved report this.
   */
  private async refreshSavedReports(): Promise<void> {
    const savedReports = await PMHubStatusService.getListOfRecords();
    this.savedReportArray.value = this.generateReportList(savedReports);
  }

  /**
   * Load the latest record into the page.
   */
  private async loadLatestRecord(): Promise<void> {
    const projectStatusData = await PMHubStatusService.getLatestProjectStatuses();
    const statusDocument: PMStatusDocument = new PMStatusDocument();
    statusDocument.asOf = projectStatusData.asOf;
    this.populateRecordInfo(projectStatusData, statusDocument);
    this.statusReportSelection.select(0);
  }

  /**
   * Populate the page based on record loaded.
   *
   * @param statusData the status date
   * @param statusDocument the status document.
   */
  private populateRecordInfo(
    statusData: SearchResultTreeNode<ProjectStatus, number>,
    statusDocument: PMStatusDocument
  ): void {
    this.pmHubStatusPage.currentSourceQuery = statusData.sourceQuery;
    this.pmHubStatusPage.statusReport = PMHubStatusService.groupResultData(
      statusData
    );
    this.pmHubStatusPage.currentSourceQuery = statusData.sourceQuery;
    this.pmHubStatusPage.record = statusDocument;
    this.refreshState();

    this.commandButtons.updateButtonStatuses(this.state);
    this.rowNumber = 1;
  }

  /**
   * Refresh the data with the backing object.
   */
  private refreshState(): void {
    this.setState(this.pmHubStatusPage);
  }

  /**
   * Wrap all asyc calls into this.
   */
  private async loadData(): Promise<void> {
    await this.loadLatestRecord();
  }

  /**
   * Write out the status node.
   *
   * @param projectStatusNode the node to write
   */
  private writeStatusRow(
    projectStatusNode: SearchResultTreeNode<ProjectStatus, number>
  ): JSX.Element {
    const rowData: ProjectStatus | undefined = projectStatusNode.data;

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
                {ProjectUtils.formatDateWithNoTime(rowData.targetDate)}
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
              Activity Area #{this.rowNumber++}: {rowData.title}
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
                {rowData.keyIssues.map((value, index) => {
                  return <li key={index}>{value}</li>;
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
        {this.state.statusReport?.get(groupTitle)?.map((value, index) => {
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
    savedDocuments?: PMStatusDocument[]
  ): IListBoxItem[] {
    const itemList: IListBoxItem[] = [{
      // Add the latest
      id: PMHubStatus.LATEST_REPORT,
      text: "Latest"
    },{
      // Divider
      id: "divider",
      type: ListBoxItemType.Divider
    }];

    if (savedDocuments && savedDocuments.length > 0) {
      itemList.push({
        id: "Saved Reports",
        type: ListBoxItemType.Header,
        text: "Saved Reports"
      });

      for (const report of savedDocuments) {
        itemList.push({
          id: report.id as string,
          text: report.name
        });
      }
    }

    return itemList;
  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow">
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
                />
              </Observer>
            </HeaderDescription>
          </HeaderTitleArea>
          <HeaderCommandBar items={this.commandButtons.getButtons()} />
        </CustomHeader>
        <div className="page-content-left page-content-right page-content-top">
          <table className="status-report-tables">
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
            this.state.statusReport == undefined && (
              <tbody>
                <tr>
                  <td colSpan={3}>
                    <div className="flex-row v-align-middle justify-center full-size">
                      <Spinner size={SpinnerSize.large} label="Loading ..." />
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
                              <a href={this.state.queryUrl} target={"_top"}>
                                {this.state.currentSourceQuery?.name}
                              </a>{" "}
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

ReactDOM.render(<PMHubStatus />, document.getElementById("root"));
