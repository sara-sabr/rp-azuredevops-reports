import "./PMHubStatus.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
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


class PMHubStatus extends React.Component<{}> {
  private statusReportSelection = new DropdownSelection();

  constructor(props: {}) {
    super(props);
  }

  public componentDidMount() {
    SDK.init();
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
      </Page>
    );
  }
}

ReactDOM.render(<PMHubStatus />, document.getElementById("root"));
