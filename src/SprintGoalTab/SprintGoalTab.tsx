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
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";

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

  /**
   * The current iteration.
   */
  private currentIterationId:string = "";

  /**
   * The title of the goal.
   *
   * Note:
   * Needed for the text field edits as TextField requires Oberservable wrapped fields.
   */
  private goalTitle = new ObservableValue<string>("");

  constructor(props: {}) {
    super(props);
    this.state = { loading: true, goal: new SprintGoalEntity() };
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
  private registerEventHandlers(): void {
    let _self = this;

    // Event handler mapping for backlog tied to json definition.
    // This is also needed to handle the exceptions if no event defined.
    SDK.register("backlogTabObject", {
      pageTitle: function() {
        // Do nothing.
      },
      updateContext: function(state: any) {
        if (state.iterationId !== _self.currentIterationId) {
          _self.currentIterationId = state.iterationId;
          _self.loadIterationGoal();
        }
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

    this.commandButtons.attachOnSaveActivate(() => {
      _self.saveGoal();
    });
  }

  /**
   * Save the goal
   */
  private async saveGoal():Promise<void> {
    let goal = this.state.goal;
    this.startTask();

    goal.title = this.goalTitle.value;

    if (this.goalEditor && goal) {
      goal.description = this.goalEditor.getContent()
    }

    if (goal) {
      goal.status = this.goalStatesList.value[this.goalStateSelection.value[0].beginIndex].id;
      goal = await SprintGoalService.save(goal);
      await this.updateState(goal);
    }
    this.finishTask();
  }

  /**
   * Mount activiites that are async.
   */
  private async performMountAsync(): Promise<void> {
    await SDK.init();
    this.currentIterationId = await SprintGoalService.getInitialIterationId();
    await this.loadIterationGoal();
  }

  /**
   * Load the iterationg goal.
   */
  private async loadIterationGoal():Promise<void> {
    this.startTask();
    const goal = await SprintGoalService.getIterationGoal(this.currentIterationId);
    await this.updateState(goal);
    this.finishTask();
  }

  /**
   * Trigger sprint goal to be undefined to force a reload.
   */
  private startTask():void {
    this.setState({loading: true});
  }

  /**
   * Trigger sprint goal to be undefined to force a reload.
   */
  private finishTask():void {
    this.setState({loading: false});

    // Need to recreat the editor as DOM destruction happens on the page.
    const divElement = document.getElementById(
      "goalDescription"
    ) as HTMLDivElement;
    this.goalEditor = RoosterJs.createEditor(divElement);
    this.goalEditor.setContent(this.state.goal.description);
  }

  /**
   * Update the page based on new data.
   *
   * @param goal the goal
   */
  private async updateState(goal: SprintGoalEntity): Promise<void> {
    if (goal === undefined) {
      return;
    }

    await this.selectGoalStatus(goal);
    this.goalTitle.value = goal.title;
    this.setState({goal: goal})
  }

  /**
   * Select the target goal's state.
   *
   * @param goal the goal state
   */
  private async selectGoalStatus(goal: SprintGoalEntity):Promise<void> {
    // Select the current state.
    this.goalStatesList.value = await SprintGoalService.getAvailableGoalStates(goal);
    const allWitStates = this.goalStatesList.value;
    let found = false;
    for (let idx = 0; idx < allWitStates.length; idx++) {
      if (allWitStates[idx].id === goal.status) {
        this.goalStateSelection.select(idx);
        found = true;
        break;
      }
    }

    if (!found) {
      this.goalStateSelection.select(0);
    }
  }

  public render(): JSX.Element {
    return (
      <Page className="flex-grow" key="SprintGoalTab">
       {/** In progress. */
          this.state.loading && (
          <div className="flex-row v-align-middle justify-center full-size">
            <Spinner
              size={SpinnerSize.large}
              label="Please wait ..."
            />
          </div>
        )}
       {/** In progress. */
          !this.state.loading && (
          <React.Fragment>
        <CustomHeader className="bolt-header-with-commandbar">
          <HeaderTitleArea>
            <HeaderTitleRow>
              <HeaderTitle titleSize={TitleSize.Large} className="flex-grow">
                Sprint Goal
              </HeaderTitle>
            </HeaderTitleRow>
          </HeaderTitleArea>
          <Observer items={this.commandButtons.buttons}>
            <HeaderCommandBar items={this.commandButtons.buttons.value} />
          </Observer>
        </CustomHeader>
        <div className="page-content page-content-top" id="goalSection">
          <div className="form-group">
            <label htmlFor="goalTitle">Title</label>
            <TextField
              inputId="goalTitle"
                    value={this.goalTitle}
                    maxLength={255}
                    required={true}
                    onChange={(e, newValue) => {
                      this.goalTitle.value = newValue;
                    }}
                    placeholder="Provide a title for the new Sprint Goal"
                    width={TextFieldWidth.auto}
                  />
          </div>
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
        </React.Fragment>
        )}
      </Page>
    );
  }
}

ReactDOM.render(<SprintGoalTab />, document.getElementById("root"));
