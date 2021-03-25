import "./PMHubAbout.scss";

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { ZeroData } from "azure-devops-ui/ZeroData";

class PMHubAbout extends React.Component<{}> {
  constructor(props: {}) {
    super(props);
  }

  public componentDidMount() {
    SDK.init();
  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow">
        <Header title="About" />
        <ZeroData
          imagePath="../../img/logo.png"
          imageAltText="IT RP Logo"
          primaryText="IT Research and Prototyping"
        />
      </Page>
    );
  }
}

ReactDOM.render(<PMHubAbout />, document.getElementById("root"));
