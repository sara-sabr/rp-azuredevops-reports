// Library Level
import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { IMenuItem, MenuItemType } from "azure-devops-ui/Menu";
import { ObservableValue } from "azure-devops-ui/Core/Observable";

// Project Level
import { IStatusReportHubState } from "./IStatusReportHub.state";
import { StatusReportService } from "./StatusReport.service";
import { PrintPDF } from "../Print/PrintPDF";

/**
 * The menu bar for status report page.
 */
export class StatusReportCommandMenu {
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
    disabled: true,
    onActivate: function() {
      PrintPDF.eventHandlderPrint();
    }
  };

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
    this.downloadButton,
    this.refreshButton,
    this.saveButton,
    this.deleteButton
  ]);

  /**
   * Update the button states.
   *
   * @param currentPage the current page data
   */
  public updateButtonStatuses(currentPage: IStatusReportHubState): void {
    /*
     * Record can only be saved if not approved state. Presently, only
     * the latest copy is not approved state.
     */
    const saveableRecord =
      currentPage.record != undefined &&
      (currentPage.record.approved === undefined ||
        !currentPage.record.approved);

    /*
     * A record is considered persisted when a record id exists
     * and not the fictitious "Latest".
     */
    const storedRecord =
      currentPage.record != undefined &&
      currentPage.record.id != undefined &&
      currentPage.record.id != StatusReportService.LATEST_RECORD.id;

    this.saveButton.disabled = !saveableRecord;
    this.deleteButton.disabled = !storedRecord;
    this.refreshButton.disabled = !saveableRecord;
    this.downloadButton.disabled = false;

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
    this.attachOnRefreshActivate(event);
  }
}
