import "./SprintGoalTab.scss";

// Library Level
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IListBoxItem, ListBoxItemType } from "azure-devops-ui/ListBox";
import { Page } from "azure-devops-ui/Page";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";

// Project Level
import { ISprintGoalState } from "./ISprintGoal.state";
import { ProjectService } from "../Common/Project.service";

/**
 * The status report page.
 */
class SprintGoalTab extends React.Component<{}, ISprintGoalState> {
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
    this.performMountAsync();
  }

  /**
   * Mount activiites that are async.
   */
  private async performMountAsync():Promise<void> {
    await SDK.init();
    console.log('Fired');
    console.log(ProjectService.getCurrentTeamId());
    SDK.register("backlogTabObject", {
        pageTitle: function() {
            return "Hello Tab";
        },
        updateContext: function() {
        },
        isInvisible: function() {
            return false;
        },
        isDisabled: function() {
            return false;
        }
    });
  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow" key="SprintGoalTab">
          TEst
      </Page>
    );
  }
}

ReactDOM.render(<SprintGoalTab />, document.getElementById("root"));
