import "./SprintGoalTab.scss";

// Library Level
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IListBoxItem, ListBoxItemType } from "azure-devops-ui/ListBox";
import { Page } from "azure-devops-ui/Page";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";

// Project Level
import { Constants } from "../Common/Constants";

/**
 * The status report page.
 */
class SprintGoalTab extends React.Component<{}, {}> {

  constructor(props: {}) {
    super(props);
  }

  /**
   * @inheritdoc
   *
   * Note: This is essentially called as part of react lifecycle.
   * https://reactjs.org/docs/state-and-lifecycle.html
   */
  public componentDidMount() {

  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow" key="SprintGoalTab">
          Hello World
      </Page>
    );
  }
}

ReactDOM.render(<SprintGoalTab />, document.getElementById("root"));
