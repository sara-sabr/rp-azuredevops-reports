import "./SprintGoalTab.scss";
import * as RoosterJs from "roosterjs";

// Library Level
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";

import { HeaderCommandBar } from "azure-devops-ui/HeaderCommandBar";
import {
  CustomHeader,
  HeaderTitleArea,
  HeaderTitle,
  HeaderTitleRow,
  TitleSize
} from "azure-devops-ui/Header";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Observer } from "azure-devops-ui/Observer";
import { Page } from "azure-devops-ui/Page";

// Project Level
import { ISprintGoalState } from "./ISprintGoal.state";
import { SprintGoalCommandMenu } from "./SprintGoalCommandMenu.ui";
import { SprintGoalService } from "./SprintGoal.service";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { SprintGoalEntity } from "./SprintGoal.entity";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { ObservableValue } from "azure-devops-ui/Core/Observable";

/**
 * The status report page.
 */
class SprintGoalTab extends React.Component<{}, ISprintGoalState> {
  /**
   * Menu Buttons.
   */
  private commandButtons: SprintGoalCommandMenu;

  /**
   * Description of a goal.
   */
  private goalEditor: RoosterJs.IEditor | undefined;

  /**
   * The goal state selected.
   */
  private goalStateSelection = new DropdownSelection();

  /**
   * The list of reports saved. (This is using observer pattern)
   */
  private goalStatesList = new ObservableValue<IListBoxItem[]>([]);

  constructor(props: {}) {
    super(props);
    this.state = { goal: new SprintGoalEntity() };
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

    // Create the editor.
    const divElement = document.getElementById(
      "goalDescription"
    ) as HTMLDivElement;
    this.goalEditor = RoosterJs.createEditor(divElement);
  }

  /**
   * Register all event handlers.
   */
  private registerEventHandlers(): void {
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
  private async performMountAsync(): Promise<void> {
    await SDK.init();
    const goalState = await SprintGoalService.getCurrentGoal();
    await this.updateState(goalState);
  }

  /**
   * Update the page based on new data.
   *
   * @param goalState the goal state
   */
  private async updateState(goalState: ISprintGoalState): Promise<void> {
    if (this.goalEditor === undefined || goalState.goal === undefined) {
      return;
    }

    this.goalEditor.setContent(goalState.goal.description);

    // Select the current state.
    this.goalStatesList.value = await SprintGoalService.getAvailableGoalStates(goalState.goal);
    const allWitStates = this.goalStatesList.value;
    for (let idx = 0; idx < allWitStates.length; idx++) {
      if (allWitStates[idx].id === goalState.goal.status) {
        this.goalStateSelection.select(idx);
        break;
      }
    }

    this.setState(goalState);
  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow" key="SprintGoalTab">
        <CustomHeader className="bolt-header-with-commandbar">
          <HeaderTitleArea>
            <HeaderTitleRow>
              <HeaderTitle titleSize={TitleSize.Large} className="flex-grow">
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
        <div className="page-content page-content-top" id="goalSection">
          <div className="form-group">
            <div className="workitemlabel label-control">
              <label htmlFor="goalCommitted">State</label>
              <Observer items={this.goalStatesList}>
                <Dropdown
                  ariaLabel="Goal State"
                  placeholder="Goal State"
                  items={this.goalStatesList.value}
                  selection={this.goalStateSelection}
                />
              </Observer>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="goalDescription">Details</label>
            <div id="goalDescription"></div>
            <small>
              Edit the work item directly for full rich editor experience.
            </small>
          </div>
        </div>
      </Page>
    );
  }
}

ReactDOM.render(<SprintGoalTab />, document.getElementById("root"));
