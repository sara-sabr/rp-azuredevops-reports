import "./PMHubStatus.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { format as formatDate } from "date-fns";
import { Page } from "azure-devops-ui/Page";
import { Pill } from "azure-devops-ui/Pill";
import {
  CustomHeader,
  HeaderDescription,
  HeaderTitle,
  HeaderTitleArea,
  HeaderTitleRow,
  TitleSize
} from "azure-devops-ui/Header";
import {
  IStatusProps,
  Statuses,
  Status,
  StatusSize
} from "azure-devops-ui/Status";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import { commandBarItemsAdvanced } from "./Header";
import { ProjectStatus } from "./ProjectStatus";
import { IPMHubStatusPage } from "./IPMHubStatusPage";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { Constants } from "../common/Constants";
import { PMHubStatusUtils } from "./PMHubStatusUtils";
import { ZeroData } from "azure-devops-ui/ZeroData";
import { SearchResultTreeNode } from "../common/SearchResultTreeNode";
import { SearchUtils } from "../common/SearchUtils";
import { PMStatusDocument } from "./PMStatusRecord";
import { IListBoxItem, ListBoxItemType } from "azure-devops-ui/ListBox";

/**
 * The status report page.
 */
class PMHubStatus extends React.Component<{}, IPMHubStatusPage> {
  private statusReportSelection = new DropdownSelection();
  private rowNumber: number = 1;
  private static LATEST_REPORT:string  = "Latest";

  constructor(props: {}) {
    super(props);
    this.state = { statusReport: undefined,
                   reportList: [] };
  }

  public componentDidMount() {
    SDK.init();
    this.loadData();
  }

  /**
   * Wrap all asyc calls into this.
   */
  private async loadData(): Promise<void> {

    const savedReports = await PMHubStatusUtils.getListOfReports();

    // Load the requested status report and if none selected, load the latest.
    const projectStatusData = await PMHubStatusUtils.getLatestProjectStatuses();
    const queryUrl = await SearchUtils.getQueryURL(
      projectStatusData.sourceQuery
    );

    const statusDocument:PMStatusDocument = new PMStatusDocument();
    statusDocument.asOf = projectStatusData.asOf;
    statusDocument.name = "Weekly Report of 2021-03-27";
    const groupedData = PMHubStatusUtils.groupResultData(projectStatusData);

    // Page data.
    this.setState({
      statusReport: groupedData,
      queryUrl: queryUrl,
      currentSourceQuery: projectStatusData.sourceQuery,
      record: statusDocument,
      reportList: savedReports
    });
    this.rowNumber = 1;
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
              <span>{formatDate(rowData.targetDate, "LLL d yyyy")}</span>
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
    let statusProp: IStatusProps = Statuses.Queued;
    let statusText: string = "Pending";

    if (riskLevel === Constants.WIT_RISK_HIGH) {
      statusProp = Statuses.Failed;
      statusText = "High";
    } else if (riskLevel === Constants.WIT_RISK_MED) {
      statusProp = Statuses.Warning;
      statusText = "Medium";
    } else if (riskLevel === Constants.WIT_RISK_LOW) {
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
   */
  private statusReportList():IListBoxItem[] {
    const itemList:IListBoxItem[] = [];

    // Add the latest
    itemList.push({
      id: 'Latest',
      text: 'Latest'
    });
    itemList.push({
      id: "divider",
      type: ListBoxItemType.Divider,
    });

    if (this.state.reportList && this.state.reportList.length > 0) {
      itemList.push({
        id: "Saved Reports",
        type: ListBoxItemType.Header,
        text: "Saved Reports"
      });

      for (const report of this.state.reportList) {
        itemList.push({
          id: report.id as string,
          text: report.name
        })
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
              <Dropdown
                ariaLabel="Report Date"
                placeholder="Select a report"
                showFilterBox={true}
                items={this.statusReportList()}
                selection={this.statusReportSelection}
              />
            </HeaderDescription>
          </HeaderTitleArea>
          <HeaderCommandBar items={commandBarItemsAdvanced} />
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
