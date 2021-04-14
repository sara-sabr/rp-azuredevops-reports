import "./SprintGoalTab.scss";

// Library Level
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import { CustomHeader, HeaderTitleArea, HeaderTitle, HeaderTitleRow, TitleSize } from "azure-devops-ui/Header";
import { Observer } from "azure-devops-ui/Observer";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { IListBoxItem, ListBoxItemType } from "azure-devops-ui/ListBox";
import { Page } from "azure-devops-ui/Page";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";

// Project Level
import { ISprintGoalState } from "./ISprintGoal.state";
import { SprintGoalCommandMenu } from './SprintGoalCommandMenu.ui';
import { SprintGoalService } from "./SprintGoal.service";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { SprintGoalEntity } from "./SprintGoal.entity";

/**
 * The status report page.
 */
class SprintGoalTab extends React.Component<{}, ISprintGoalState> {
  /**
   * Menu Buttons.
   */
  private commandButtons: SprintGoalCommandMenu;

  constructor(props: {}) {
    super(props);
    this.state = ({goal: new SprintGoalEntity()});
    this.commandButtons = new SprintGoalCommandMenu();
  }

  /**
   * @inheritdoc
   *
   * Note: This is essentially called as part of react lifecycle.
   * https://reactjs.org/docs/state-and-lifecycle.html
   */
  public componentDidMount() {
    this.performMountAsync();
    this.registerEventHandlers();
  }

  /**
   * Register all event handlers.
   */
  private registerEventHandlers():void {

    // Event handler mapping for backlog tied to json definition.
    // This is also needed to handle the exceptions if no event defined.
    SDK.register("backlogTabObject", {
        pageTitle: function() {
            // Do nothing.
        },
        updateContext: function() {
            // Do nothing.
        },
        isInvisible: function() {
            // Do nothing.
            return false;
        },
        isDisabled: function() {
            // Do nothing.
            return false;
        }
    });
  }

  /**
   * Mount activiites that are async.
   */
  private async performMountAsync():Promise<void> {
    await SDK.init();
    const goalState = await SprintGoalService.getCurrentGoal();
    this.setState(goalState);
  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow" key="SprintGoalTab">

        <CustomHeader className="bolt-header-with-commandbar">
          <HeaderTitleArea>
            <HeaderTitleRow>
              <HeaderTitle
                titleSize={TitleSize.Large}
                className="flex-grow"
              >
                 <TextField
                value={this.state.goal.title}
                placeholder="Provide a title for the new Sprint Goal"
                width={TextFieldWidth.auto}
            />
              </HeaderTitle>
            </HeaderTitleRow>
          </HeaderTitleArea>
          <Observer items={this.commandButtons.buttons}>
            <HeaderCommandBar items={this.commandButtons.buttons.value} />
          </Observer>
        </CustomHeader>
        <div className="page-content page-content-top">
        </div>
      </Page>
    );
  }
}

ReactDOM.render(<SprintGoalTab />, document.getElementById("root"));
