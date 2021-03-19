import "./PMHubStatus.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { Page } from "azure-devops-ui/Page";
import { Icon } from "azure-devops-ui/Icon";
import { Card } from "azure-devops-ui/Card";
import {
  CustomHeader,
  HeaderDescription,
  HeaderTitle,
  HeaderTitleArea,
  HeaderTitleRow,
  TitleSize
} from "azure-devops-ui/Header";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";

import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import {commandBarItemsAdvanced} from './Header'
import { Utils } from "../common/Utils";
import { PMHubStatusConfiguration } from "./Configuration";
import { ProjectStatus } from "./ProjectStatus";
import { TreeNode } from "../common/TreeNode";


class PMHubStatus extends React.Component<{}> {
  private statusReportSelection = new DropdownSelection();

  constructor(props: {}) {
    super(props);
    this.state = { data: [] };
  }

  public componentDidMount() {
    SDK.init();
    this.loadData();
  }

  /**
   * Wrap all asyc calls into this.
   */
  private async loadData():Promise<void> {
    const queryLatestStatusResults = await Utils.executeTreeQuery(PMHubStatusConfiguration.getQueryForLatestStatus(), ProjectStatus);
    this.setState({data: queryLatestStatusResults});
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
        <Card className="flex-grow">
          <table className="flex-grow status-report-tables">
            <thead>
              <tr>
                <th className="statusColumn">Risk</th>
                <th className="dateColumn">Estimated Due Date</th>
                <th className="detailsColumn">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="statusColumn font-size-l">
                  <Icon ariaLabel="High Risk" iconName="Error" className="risk-high" />
                  <Icon ariaLabel="Medium Risk" iconName="Warning" className="risk-med" />
                  <Icon ariaLabel="Low Risk" iconName="StatusCircleCheckmark" className="risk-low" />
                </td>
                <td className="dateColumn">April/May, 2021</td>
                <td className="detailsColumn">
                Activity Area #1:  Project 1 <br /> <br />
                <b>Objective:</b>
                <ul>
                  <li>Demonstrate .</li>
                  <li>Follow up :</li>
                  <li>"Members recommended”</li>
                </ul>
                <b>Action/Status:</b>
                <ul>
                  <li>Identifying potential uses case / Underway</li>
                </ul>
                <b>Key Issues:</b>
                <ul>
                  <li>Limited capacity.</li>
                </ul>
                </td>
              </tr>
              <tr>
                <td className="statusColumn">Green</td>
                <td className="dateColumn">April/May, 2021</td>
                <td className="detailsColumn">Project #2 </td>
              </tr>
              <tr>
                <td className="statusColumn">Green</td>
                <td className="dateColumn">April/May, 2021</td>
                <td className="detailsColumn">Project #3 </td>
              </tr>
            </tbody>
          </table>
        </Card>

      </Page>
    );
  }
}

ReactDOM.render(<PMHubStatus />, document.getElementById("root"));
