import "./PMHubStatus.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { format as formatDate } from 'date-fns'
import { Page } from "azure-devops-ui/Page";
import { Pill, PillSize, PillVariant } from "azure-devops-ui/Pill";
import { IColor } from "azure-devops-ui/Utilities/Color";
import {
  CustomHeader,
  HeaderDescription,
  HeaderTitle,
  HeaderTitleArea,
  HeaderTitleRow,
  TitleSize
} from "azure-devops-ui/Header";
import {IStatusProps, Statuses, Status, StatusSize} from "azure-devops-ui/Status"
import { Dropdown } from "azure-devops-ui/Dropdown";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { HeaderCommandBar, toggleFullScreen } from "azure-devops-ui/HeaderCommandBar";
import {commandBarItemsAdvanced} from './Header'
import { ProjectStatus } from "./ProjectStatus";
import { IPMHubStatusPage } from "./IPMHubStatusPage";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { TreeNode } from "../common/TreeNode";
import { Constants } from "../common/Constants";
import { PMHubStatusUtils } from "./PMHubStatusUtils";

class PMHubStatus extends React.Component<{}, IPMHubStatusPage> {
  private statusReportSelection = new DropdownSelection();
  private rowNumber:number = 1;

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
  private async loadData():Promise<void> {
    const latestProjectStatus = await PMHubStatusUtils.getLatestProjectStatuses();
    this.rowNumber = 1;
    this.setState({currentStatus: latestProjectStatus});
  }

  /**
   * Write out the status node.
   *
   * @param projectStatusNode the node to write
   */
  private writeStatusRow(projectStatusNode: TreeNode<ProjectStatus,number>):JSX.Element {
    const rowData:ProjectStatus | undefined = projectStatusNode.data;

    if (rowData === undefined) { return (<tr><td>No Data</td></tr>)}

    return (<tr key={rowData.id}>
      {/** Vision */
        projectStatusNode.isTopLevelNode() && (
          <td colSpan={3} className="vision">
            {rowData.title}
          </td>
        )
      }
      {/** Epic - Risk Level */
        !projectStatusNode.isTopLevelNode() && (
          /** Risk Level */
          <td className="statusColumn">
            {this.writeColumnRisk(rowData.riskLevel, rowData.id)}
          </td>
        )
      }
      {/** Epic - Date  */
        !projectStatusNode.isTopLevelNode() && (
          /** Date */
          <td>
            {rowData.targetDate && (<span>{formatDate(rowData.targetDate, 'LLL d yyyy')}</span>)}
          </td>
        )
      }
      {/** Epic - Description  */
        !projectStatusNode.isTopLevelNode() && (
          /** Date */
          <td>
            <Pill className="margin-top-4 activityTitle margin-bottom-4" excludeFocusZone={true} excludeTabStop={true}>
              Activity Area #{this.rowNumber++}: {rowData.title}
            </Pill>
            <p><b>Objective</b></p>
            <p dangerouslySetInnerHTML={{__html: rowData.objective}}></p>
            <p><b>Action/Status</b>: {rowData.status}</p>
            <p dangerouslySetInnerHTML={{__html: rowData.action}}></p>
            <p><b>Issues</b>: {rowData.keyIssues.length === 0 && ("No issues")}</p>
            {rowData.keyIssues.length > 0 && (
              <ul>
                {
                  rowData.keyIssues.map((value, index) => {
                    return (<li key={index}>{value}</li>)
                  })
                }
              </ul>
            )}
          </td>
        )
      }
      </tr>
    )
  }

  /**
   * Write the risk column.
   *
   * @param riskLevel risk level
   * @param id the wit ID
   */
  private writeColumnRisk(riskLevel:string|undefined, id:number):JSX.Element {
    let statusProp:IStatusProps = Statuses.Queued;
    let statusText:string = "Pending";

    if (riskLevel === Constants.WIT_RISK_HIGH) {
      statusProp = Statuses.Failed;
      statusText = "High"
    } else if (riskLevel === Constants.WIT_RISK_MED) {
      statusProp = Statuses.Warning;
      statusText = "Medium"
    } else if (riskLevel === Constants.WIT_RISK_LOW) {
      statusProp = Statuses.Success;
      statusText = "Low"
    }

    return (
      <Status
        {... statusProp}
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
                <HeaderTitle className="text-ellipsis" titleSize={TitleSize.Large}>
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
              <tr>
                <th className="statusColumn">Risk</th>
                <th className="dateColumn">Estimated Due Date</th>
                <th className="detailsColumn">Details</th>
              </tr>
            </thead>
            <tbody>
              {/** Print this on no data. */
                this.state.currentStatus == undefined && (
                  <tr>
                    <td colSpan={3}>
                      <div className="flex-row v-align-middle justify-center full-size">
                        <Spinner size={SpinnerSize.large} label="Loading ..."/>
                      </div>
                    </td>
                  </tr>
                )
              }

              {/** Status report with data populated. */
                this.state.currentStatus !== undefined &&
                TreeNode.walkTreePreOrder(this.state.currentStatus).map((value, index) => {
                  return this.writeStatusRow(value);
                })
              }
            </tbody>
          </table>
        </div>
      </Page>
    );
  }
}

ReactDOM.render(<PMHubStatus />, document.getElementById("root"));
