import { ISprintGoalState } from "./ISprintGoal.state";
import { SprintGoalEntity } from "./SprintGoal.entity";

/**
 * Sprint goal repository.
 */
export class SprintGoalRepository {
    public static async findSprintGoal(sprintGoal: SprintGoalEntity): Promise<SprintGoalEntity> {
        return new SprintGoalEntity();
    }
}