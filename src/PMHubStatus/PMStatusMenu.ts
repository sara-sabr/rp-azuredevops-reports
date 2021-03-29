// Library Level
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { IMenuItem, MenuItemType } from "azure-devops-ui/Menu";

// Project Level
import { IPMHubStatusPage } from "./IPMHubStatusPage";

/**
 * The menu bar for project status page.
 */
export class PMStatusMenu {
  /**
   * The download button
   */
  private downloadButton: IHeaderCommandBarItem = {
    iconProps: {
      iconName: "Download"
    },
    id: "itrp-pm-status-hub-header-download",
    important: true,
    text: "Download",
    disabled: true
  };

  /**
   * Share button.
   */
  private shareButton: IHeaderCommandBarItem = {
    iconProps: {
      iconName: "Share"
    },
    id: "itrp-pm-status-hub-header-share",
    text: "Share",
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
   * The approve button.
   */
  private approveButton: IHeaderCommandBarItem = {
    iconProps: {
      iconName: "CheckMark"
    },
    id: "itrp-pm-status-hub-header-approve",
    important: false,
    text: "Approve item",
    disabled: true
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

  /**
   * Get the buttons for this menu.
   *
   * @returns an array of buttons
   */
  public getButtons(): IHeaderCommandBarItem[] {
    return [
      this.downloadButton,
      this.shareButton,
      this.saveButton,
      this.approveButton,
      { id: "separator", itemType: MenuItemType.Divider },
      this.deleteButton
    ];
  }

  /**
   * Update the button states.
   *
   * @param currentPage the current page data
   */
  public updateButtonStatuses(currentPage: IPMHubStatusPage): void {
    const saveableRecord =
      currentPage.record != undefined && currentPage.record.id === undefined;
    const storedRecord =
      currentPage.record != undefined && currentPage.record.id != undefined;

    this.saveButton.disabled = !saveableRecord;
    this.deleteButton.disabled = !storedRecord;
    this.shareButton.disabled = !storedRecord;
    this.downloadButton.disabled = !storedRecord;
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
   * Attach the event to a share button click.
   *
   * @param event event to fire
   */
  public attachOnShareActivate(
    event: (
      menuItem: IMenuItem,
      event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => boolean | void
  ): void {
    this.shareButton.onActivate = event;
  }

  /**
   * Attach the event to a download button click.
   *
   * @param event event to fire
   */
  public attachOnDownloadActivate(
    event: (
      menuItem: IMenuItem,
      event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>
    ) => boolean | void
  ): void {
    this.downloadButton.onActivate = event;
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
    this.attachOnDownloadActivate(event);
    this.attachOnSaveActivate(event);
    this.attachOnShareActivate(event);
  }
}
