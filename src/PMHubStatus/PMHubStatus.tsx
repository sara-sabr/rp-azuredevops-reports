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
import { Utils } from "../common/Utils";

/**
 * The status report page.
 */
class PMHubStatus extends React.Component<{}, IPMHubStatusPage> {
  private statusReportSelection = new DropdownSelection();
  private rowNumber: number = 1;

  constructor(props: {}) {
    super(props);
    this.state = { currentStatus: undefined };
  }

  public componentDidMount() {
    SDK.init();
    this.loadData();
  }

  /**
   * Wrap all asyc calls into this.
   */
  private async loadData(): Promise<void> {
    const latestProjectStatus = await PMHubStatusUtils.getLatestProjectStatuses();
    const queryUrl = await Utils.getQueryURL(latestProjectStatus.sourceQuery);
    const groupedData = PMHubStatusUtils.groupResultData(latestProjectStatus);
    this.rowNumber = 1;
    this.setState({
      currentStatus: groupedData,
      queryUrl: queryUrl,
      sourceQuery: latestProjectStatus.sourceQuery
    });
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
        {this.state.currentStatus?.get(groupTitle)?.map((value, index) => {
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
                items={[
                  { id: "Latest", text: "Latest" },
                  { id: "2020-03-18", text: "2020-03-18" },
                  { id: "2020-03-11", text: "2020-03-11" }
                ]}
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
            this.state.currentStatus == undefined && (
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
            this.state.currentStatus !== undefined &&
              this.state.currentStatus.size === 0 && (
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
                                {this.state.sourceQuery?.name}
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
            this.state.currentStatus !== undefined &&
              this.state.currentStatus.size >= 0 &&
              [...this.state.currentStatus].map(entry => {
                return this.writeGroup(entry[0]);
              })}
          </table>
        </div>
      </Page>
    );
  }
}

ReactDOM.render(<PMHubStatus />, document.getElementById("root"));
