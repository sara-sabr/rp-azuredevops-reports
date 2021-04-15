import { SprintGoalEntity } from "./SprintGoal.entity";

/**
 * Used by the sprint goal page to display current sprint goal for the selected team and iteration.
 */
export interface ISprintGoalState {
  /**
   * The sprint goal.
   */
  goal: SprintGoalEntity;

  /**
   * Page state is still loading.
   */
  loading: boolean;

  /** The goal url */
  goalUrl:string;
}
