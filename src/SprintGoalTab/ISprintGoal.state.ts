/**
 * Used by the sprint goal page to display current sprint goal for the selected team and iteration.
 */
export interface ISprintGoalState {
    /**
     * The area ID.
     */
    areaID: string;

    /**
     * The iteration ID.
     */
    iterationId: string;

    /**
     * The sprint goal description.
     */
    description: string;

    /**
     * The sprint goal status.
     */
    status: string;

    /**
     * Work Item ID.
     */
    id: string;
}