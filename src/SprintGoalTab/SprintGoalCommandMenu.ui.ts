// Library Level
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { IMenuItem } from "azure-devops-ui/Menu";
import { ObservableValue } from "azure-devops-ui/Core/Observable";
import { ISprintGoalState } from "./ISprintGoal.state";

/**
 * The menu bar for sprint goal page.
 */
export class SprintGoalCommandMenu {
  /**
   * Refresh button.
   */
  private refreshButton: IHeaderCommandBarItem = {
    iconProps: {
      iconName: "Refresh"
    },
    id: "itrp-pm-status-hub-header-refresh",
    text: "Refresh",
    disabled: true
  };

  /**
   * Save button.
   */
  private saveButton: IHeaderCommandBarItem = {
    iconProps: {
      iconName: "Save"
    },
    id: "itrp-pm-status-hub-header-save",
    important: true,
    isPrimary: true,
    text: "Save"
  };

  /**
   * Delete button.
   */
  private deleteButton: IHeaderCommandBarItem = {
    iconProps: {
      iconName: "Delete"
    },
    id: "itrp-pm-status-hub-header-delete",
    text: "Delete",
    disabled: true
  };

  /** Used to trigger update. */
  buttons: ObservableValue<IHeaderCommandBarItem[]> = new ObservableValue([
    this.refreshButton,
    this.saveButton,
    this.deleteButton
  ]);

  /**
   * Update the button states.
   *
   * @param currentPage the current page data
   */
  public updateButtonStatuses(currentPage: ISprintGoalState): void {
    // Notify the subscribers.
    this.buttons.notify(this.buttons.value, "updateButtonStatus");
  }

  /**
   * Attach the event to a save button click.
   *
   * @param event event to fire
   */
  public attachOnSaveActivate(
    event: (
      menuItem: IMenuItem,
      event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => boolean | void
  ): void {
    this.saveButton.onActivate = event;
  }

  /**
   * Attach the event to a delete button click.
   *
   * @param event event to fire
   */
  public attachOnDeleteActivate(
    event: (
      menuItem: IMenuItem,
      event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => boolean | void
  ): void {
    this.deleteButton.onActivate = event;
  }

  /**
   * Attach the event to a refresh button click.
   *
   * @param event event to fire
   */
  public attachOnRefreshActivate(
    event: (
      menuItem: IMenuItem,
      event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => boolean | void
  ): void {
    this.refreshButton.onActivate = event;
  }

  /**
   * Bulk attach the event to all buttons.
   *
   * @param event the event to fire
   */
  public attachOnButtonActivate(
    event: (
      menuItem: IMenuItem,
      event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => boolean | void
  ): void {
    this.attachOnDeleteActivate(event);
    this.attachOnSaveActivate(event);
    this.attachOnRefreshActivate(event);
  }
}
