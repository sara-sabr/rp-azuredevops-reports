import { getClient } from "azure-devops-extension-api";

import { SprintGoalEntity } from "./SprintGoal.entity";
import { CommonRepositories } from "../Common/Common.repository";
import { TeamContext } from "azure-devops-extension-api/Core/Core";
import { SearchRepository } from "../Search/Search.repository";
import { Constants } from "../Common/Constants";
import { SearchResultEntity } from "../Search/SearchResult.entity";
import { WorkItemStateResultModel } from "azure-devops-extension-api/WorkItemTrackingProcess";
import { JsonPatchDocument, JsonPatchOperation, Operation } from "azure-devops-extension-api/WebApi";

/**
 * Sprint goal repository.
 */
export class SprintGoalRepository {
  /** Delimiter used in the query for area path */
  private static readonly DELIM_AREA_PATH = "xxAREA_PATHxx";
  /** Delimiter used in the query iteration */
  private static readonly DELIM_ITERATION = "xxITERATIONxx";
  /** Query for a sprint goal */
  private static readonly QUERY_GOAL =
    "SELECT " +
    "[" +
    Constants.WIT_FIELD_ID +
    "]" +
    ",[" +
    Constants.WIT_FIELD_TITLE +
    "]" +
    ",[" +
    Constants.WIT_FIELD_TYPE +
    "]" +
    ",[" +
    Constants.WIT_FIELD_PARENT_ID +
    "]" +
    ",[" +
    Constants.WIT_FIELD_DESCRIPTION +
    "]" +
    ",[" +
    Constants.WIT_FIELD_STATE +
    "]" +
    ",[" +
    Constants.WIT_FIELD_ITERATION_PATH +
    "]" +
    ",[" +
    Constants.WIT_FIELD_AREA_PATH +
    "]" +
    " FROM WorkItems " +
    " WHERE [" +
    Constants.WIT_FIELD_PROJECT +
    "]  = @project" +
    " AND [" +
    Constants.WIT_FIELD_TYPE +
    "] = '" +
    Constants.WIT_TYPE_GOAL +
    "'" +
    " AND [" +
    Constants.WIT_FIELD_AREA_PATH +
    "] = '" +
    SprintGoalRepository.DELIM_AREA_PATH +
    "'" +
    " AND [" +
    Constants.WIT_FIELD_ITERATION_PATH +
    "] = '" +
    SprintGoalRepository.DELIM_ITERATION +
    "'";

  /**
   * Find the sprint goal.
   *
   * @param sprintGoal the sprint goal.
   */
  public static async findSprintGoal(
    sprintGoal: SprintGoalEntity
  ): Promise<SearchResultEntity<SprintGoalEntity, number>> {
    let query = SprintGoalRepository.QUERY_GOAL;
    query = query.replace(
      SprintGoalRepository.DELIM_AREA_PATH,
      sprintGoal.areaPath
    );
    query = query.replace(
      SprintGoalRepository.DELIM_ITERATION,
      sprintGoal.iterationPath
    );

    const results = await SearchRepository.executeQueryWiql(
      query,
      SprintGoalEntity
    );

    return results;
  }

  /**
   * Find the default area path.
   *
   * @param teamContext the team context.
   * @returns the name of the area path.
   */
  public static async findDefaultAreaPathForTeam(
    teamContext: TeamContext
  ): Promise<string> {
    const workClient = CommonRepositories.WORK_API_CLIENT;
    const teamAreaPathResult = await workClient.getTeamFieldValues(teamContext);
    return teamAreaPathResult.defaultValue;
  }

  /**
   * Get the iteration path.
   *
   * @param teamContext the team context.
   * @param iterationid the team iteration id.
   * @returns iteration path for the specified team iteration.
   */
  public static async getIterationPath(
    teamContext: TeamContext,
    iterationid: string
  ): Promise<string> {
    const workClient = CommonRepositories.WORK_API_CLIENT;
    const iterationDetails = await workClient.getTeamIteration(
      teamContext,
      iterationid
    );
    return iterationDetails.path;
  }

  /**
   * Create a given entity.
   *
   * @param sprintGoal the entity to create
   * @param projectId the project ID
   * @return updated sprint goal with ID set.
   */
  public static async createGoal(sprintGoal: SprintGoalEntity, projectId:string):Promise<SprintGoalEntity> {
    const witClient = CommonRepositories.WIT_API_CLIENT;
    const jsonDoc:JsonPatchDocument = [
      {
        op: Operation.Add,
        path: "/fields/" + Constants.WIT_FIELD_TITLE,
        value: sprintGoal.title
      } as JsonPatchOperation,
      {
        op: Operation.Add,
        path: "/fields/" + Constants.WIT_FIELD_STATE,
        value: sprintGoal.status
      } as JsonPatchOperation,
      {
        op: Operation.Add,
        path: "/fields/" + Constants.WIT_FIELD_DESCRIPTION,
        value: sprintGoal.description
      } as JsonPatchOperation,
      {
        op: Operation.Add,
        path: "/fields/" + Constants.WIT_FIELD_AREA_PATH,
        value: sprintGoal.areaPath
      } as JsonPatchOperation,
      {
        op: Operation.Add,
        path: "/fields/" + Constants.WIT_FIELD_ITERATION_PATH,
        value: sprintGoal.iterationPath
      } as JsonPatchOperation
    ];

    const workItem = await witClient.createWorkItem(jsonDoc, projectId, Constants.WIT_TYPE_GOAL);
    sprintGoal.id = workItem.id;
    return sprintGoal;
  }

  /**
   * Update a given entity.
   *
   * @param sprintGoal the entity to create
   * @return updated sprint goal.
   */
  public static async updateGoal(sprintGoal: SprintGoalEntity):Promise<SprintGoalEntity> {
    const witClient = CommonRepositories.WIT_API_CLIENT;
    const jsonDoc:JsonPatchDocument = [
      {
        op: Operation.Replace,
        path: "/fields/" + Constants.WIT_FIELD_TITLE,
        value: sprintGoal.title
      } as JsonPatchOperation,
      {
        op: Operation.Replace,
        path: "/fields/" + Constants.WIT_FIELD_STATE,
        value: sprintGoal.status
      } as JsonPatchOperation,
      {
        op: Operation.Replace,
        path: "/fields/" + Constants.WIT_FIELD_DESCRIPTION,
        value: sprintGoal.description
      } as JsonPatchOperation
    ];

    await witClient.updateWorkItem(jsonDoc, sprintGoal.id);
    return sprintGoal;
  }

  /**
   * Get the available goal states.
   *
   * @param projectId the project ID.
   */
  public static async getGoalStates(projectId:string):Promise<WorkItemStateResultModel[]> {
    const processClient = CommonRepositories.PROCESS_API_CLIENT;
    const coreClient = CommonRepositories.CORE_API_CLIENT;

    // Get the current project's data.
    const teamProject = await coreClient.getProject(projectId, true);
    const allWorkItems = await processClient.getProcessWorkItemTypes(teamProject.capabilities.processTemplate.templateTypeId);
    let goalReferenceName:string|undefined = undefined;

    // Find the reference name.
    for (let workItemType of allWorkItems) {
      if (Constants.WIT_TYPE_GOAL === workItemType.name) {
        goalReferenceName = workItemType.referenceName;
        break;
      }
    }

    if (goalReferenceName) {
      const results = await processClient.getStateDefinitions(teamProject.capabilities.processTemplate.templateTypeId, goalReferenceName);
      return results;
    }

    throw new Error ("Cannot find 'Goal' in current project's process.")
  }
}
