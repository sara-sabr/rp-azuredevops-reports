// Library Level
import * as SDK from "azure-devops-extension-sdk";
import { ProjectService } from "../Common/Project.service";
import { SprintGoalRepository } from "./SprintGoal.repository";
import { TeamContext } from "azure-devops-extension-api/Core/Core";
import { ISprintGoalState } from "./ISprintGoal.state";
import { SprintGoalEntity } from "./SprintGoal.entity";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { WorkItemStateResultModel } from "azure-devops-extension-api/WorkItemTrackingProcess";

/**
 * Sprint goal service.
 */
export class SprintGoalService {

  /**
   * Get the current goal for the current displayed iteration and team.
   *
   * @returns the sprint goal state.
   */
  public static async getCurrentGoal(): Promise<ISprintGoalState> {
    const sprintGoal = new SprintGoalEntity();
    sprintGoal.areaPath = await this.getCurrentTeamDefaultAreaPath();
    sprintGoal.iterationPath = await this.getIterationPath();

    const sprintGoalResults = await SprintGoalRepository.findSprintGoal(
      sprintGoal
    );

    // There is a possibility of returning multiple sprint goals as no restrict is done on the
    // underlying data.
    if (sprintGoalResults.isEmpty()) {
      // No sprint goal, so create a new entity.
      return {} as ISprintGoalState;
    } else {
      const entry = sprintGoalResults.children[0].data;
      if (entry) {
        return { goal: entry };
      }
      throw new Error("Results don't have data bound. Bug?");
    }
  }

  /**
   * Get the states for a goal work item type.
   *
   * @param entity the sprint goal entity
   * @returns a list item of states where id and text is the state label that this current goal has access to.
   */
  public static async getAvailableGoalStates(entity: SprintGoalEntity):Promise<IListBoxItem[]> {
    const project = await ProjectService.getProject();
    const listItems:IListBoxItem[] = [];
    let goalStateModel:WorkItemStateResultModel | undefined = undefined;
    let firstCompletedStateModel:WorkItemStateResultModel | undefined = undefined;

    if (project !== undefined) {
      const stateResults = await SprintGoalRepository.getGoalStates(project.id);
      for (let state of stateResults) {
        listItems.push({
          id: state.name,
          text: state.name,
          data: {order: state.order}
        });

        if (state.name === entity.status) {
          goalStateModel = state;
        }

        if (state.stateCategory === "Completed") {
          firstCompletedStateModel = state;
        }
      }
    }

    if (goalStateModel && firstCompletedStateModel) {
      // If state found, drop all states that are of lower order.
      let item:{order: number};
      let targetOrder:number = goalStateModel.order > firstCompletedStateModel.order ? firstCompletedStateModel.order : goalStateModel.order;

      for (let idx = listItems.length - 1; idx >=0; idx--) {
        item = listItems[idx].data as {order: number};
        if (item.order < targetOrder) {
          listItems.splice(idx, 1);
        }
      }
    }

    return listItems;
  }

  /**
   * Get the current team context.
   *
   * @returns the populated team context.
   */
  private static async getTeamContext(): Promise<TeamContext> {
    const project = await ProjectService.getProject();
    const team = this.getCurrentTeam();

    if (project === undefined || team === undefined) {
      throw new Error("Not in a good state.");
    }

    return {
      project: project.name,
      projectId: project.id,
      team: team.name,
      teamId: team.id
    };
  }

  /**
   * Get the current team's default area path.
   *
   * @return area path for the current team.
   */
  public static async getCurrentTeamDefaultAreaPath(): Promise<string> {
    const teamContext = await this.getTeamContext();
    const areaPath = await SprintGoalRepository.findDefaultAreaPathForTeam(
      teamContext
    );
    return areaPath;
  }

  /**
   * Get the iteration path for the current page iteration.
   *
   * @return the current iteration path.
   */
  public static async getIterationPath(): Promise<string> {
    const teamContext = await this.getTeamContext();
    const iterationId = this.getIterationId();
    const iteration = await SprintGoalRepository.getIterationPath(
      teamContext,
      iterationId
    );
    return iteration;
  }

  /**
   * Get the current team ID.
   *
   * @returns the current team id.
   */
  public static getCurrentTeam(): { id: string; name: string } {
    // This is only available inside backlog.
    return SDK.getConfiguration().team;
  }

  /**
   * Get the current page's iteration ID being displayed.
   *
   * @returns the current page iteration ID.
   */
  public static getIterationId(): string {
    // This is only available inside backlog.
    return SDK.getConfiguration().iterationId;
  }
}
