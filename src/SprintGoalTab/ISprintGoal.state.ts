import { SprintGoalEntity } from "./SprintGoal.entity";

/**
 * Used by the sprint goal page to display current sprint goal for the selected team and iteration.
 */
export interface ISprintGoalState {
  goal: SprintGoalEntity;
}
