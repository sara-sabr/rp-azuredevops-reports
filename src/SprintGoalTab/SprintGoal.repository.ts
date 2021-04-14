import {
    getClient
  } from "azure-devops-extension-api";

import { SprintGoalEntity } from "./SprintGoal.entity";
import { CommonRepositories } from "../Common/Common.repository";
import { TeamContext } from "azure-devops-extension-api/Core/Core";
import { SearchRepository } from "../Search/Search.repository";
import { Constants } from "../Common/Constants";
import { SearchResultEntity } from "../Search/SearchResult.entity";

/**
 * Sprint goal repository.
 */
export class SprintGoalRepository {
    /** Delimiter used in the query for area path */
    private static readonly DELIM_AREA_PATH = "xxAREA_PATHxx";
    /** Delimiter used in the query iteration */
    private static readonly DELIM_ITERATION = "xxITERATIONxx";
     /** Query for a sprint goal */
     private static readonly QUERY_GOAL = "SELECT "+
                            "[" + Constants.WIT_FIELD_ID + "]" +
                            ",[" + Constants.WIT_FIELD_TITLE + "]" +
                            ",[" + Constants.WIT_FIELD_TYPE + "]" +
                            ",[" + Constants.WIT_FIELD_PARENT_ID + "]" +
                            ",[" + Constants.WIT_FIELD_DESCRIPTION +  "]" +
                            ",[" + Constants.WIT_FIELD_STATE + "]" +
                            ",[" + Constants.WIT_FIELD_ITERATION_PATH + "]" +
                            ",[" + Constants.WIT_FIELD_AREA_PATH + "]" +
                       " FROM WorkItems " +
                       " WHERE [" + Constants.WIT_FIELD_PROJECT + "]  = @project" +
                       " AND [" + Constants.WIT_FIELD_TYPE + "] = '" + Constants.WIT_TYPE_GOAL + "'" +
                       " AND [" + Constants.WIT_FIELD_AREA_PATH + "] = '" + SprintGoalRepository.DELIM_AREA_PATH + "'" +
                       " AND [" + Constants.WIT_FIELD_ITERATION_PATH + "] = '" + SprintGoalRepository.DELIM_ITERATION + "'";

    /**
     * Find the sprint goal.
     *
     * @param sprintGoal the sprint goal.
     */
    public static async findSprintGoal(sprintGoal: SprintGoalEntity): Promise<SearchResultEntity<SprintGoalEntity, number>> {
        let query = SprintGoalRepository.QUERY_GOAL;
        query = query.replace(SprintGoalRepository.DELIM_AREA_PATH, sprintGoal.areaPath);
        query = query.replace(SprintGoalRepository.DELIM_ITERATION, sprintGoal.iterationPath);

        const results = await SearchRepository.executeQueryWiql(query, SprintGoalEntity);

        return results;
    }


    /**
     * Find the default area path.
     *
     * @param teamContext the team context.
     * @returns the name of the area path.
     */
    public static async findDefaultAreaPathForTeam(teamContext: TeamContext):Promise<string> {
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
    public static async getIterationPath(teamContext: TeamContext, iterationid: string):Promise<string> {
        const workClient = CommonRepositories.WORK_API_CLIENT;
        const iterationDetails = await workClient.getTeamIteration(teamContext, iterationid);
        return iterationDetails.path;
    }
}