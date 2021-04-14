// Library Level
import * as SDK from "azure-devops-extension-sdk";
import { ProjectService } from "../Common/Project.service";
import { SprintGoalRepository } from "./SprintGoal.repository";
import { TeamContext } from "azure-devops-extension-api/Core/Core";
import { ISprintGoalState } from "./ISprintGoal.state";
import { SprintGoalEntity } from "./SprintGoal.entity";

/**
 * Sprint goal service.
 */
export class SprintGoalService {

  public static async getCurrentGoal():Promise<ISprintGoalState> {
    const sprintGoal = new SprintGoalEntity();
    sprintGoal.areaPath = await this.getCurrentTeamDefaultAreaPath();
    sprintGoal.iterationPath = await this.getIterationPath();

    const sprintGoalResults = await SprintGoalRepository.findSprintGoal(sprintGoal)

    // There is a possibility of returning multiple sprint goals as no restrict is done on the
    // underlying data.

    if (sprintGoalResults.isEmpty()) {
      // No sprint goal, so create a new entity.
      return {} as ISprintGoalState;
    } else {
      const entry = sprintGoalResults.children[0].data;
      if (entry) {
        return {goal: entry};
      }
      throw new Error("Results don't have data bound. Bug?");
    }
  }

    /**
     * Get the current team context.
     *
     * @returns the populated team context.
     */
   private static async getTeamContext():Promise<TeamContext> {
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
    }
   }

  /**
   * Get the current team's default area path.
   *
   * @return area path for the current team.
   */
    public static async getCurrentTeamDefaultAreaPath():Promise<string> {
        const teamContext = await this.getTeamContext();
        const areaPath = await SprintGoalRepository.findDefaultAreaPathForTeam(teamContext);
        return areaPath;
    }


  /**
   * Get the iteration path for the current page iteration.
   *
   * @return the current iteration path.
   */
  public static async getIterationPath():Promise<string> {
    const teamContext = await this.getTeamContext();
    const iterationId = this.getIterationId();
    const iteration = await SprintGoalRepository.getIterationPath(teamContext, iterationId);
    return iteration;
}

    /**
     * Get the current team ID.
     *
     * @returns the current team id.
     */
    public static getCurrentTeam():{id: string, name:string} {
        // This is only available inside backlog.
      return SDK.getConfiguration().team;
    }

    /**
     * Get the current page's iteration ID being displayed.
     *
     * @returns the current page iteration ID.
     */
    public static getIterationId():string {
      // This is only available inside backlog.
      return SDK.getConfiguration().iterationId;
    }
}