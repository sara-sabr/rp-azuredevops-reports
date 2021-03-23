import { IHeaderCommandBarItem } from "azure-devops-ui/HeaderCommandBar";
import { MenuItemType } from "azure-devops-ui/Menu";

/**
 * Defines the menu bar for project status report page.
 */
export const commandBarItemsAdvanced: IHeaderCommandBarItem[] = [
    {
        iconProps: {
            iconName: "Download"
        },
        id: "itrp-pm-status-hub-header-download",
        important: true,
        onActivate: () => {
            alert("Example text");
        },
        text: "Download",
        disabled: true
    },
    {
        iconProps: {
            iconName: "Share"
        },
        id: "itrp-pm-status-hub-header-share",
        onActivate: () => {
            alert("Example text");
        },
        text: "Share",
        disabled: true
    },
    {
        iconProps: {
            iconName: "Add"
        },
        id: "itrp-pm-status-hub-header-add",
        important: true,
        isPrimary: true,
        onActivate: () => {
            alert("This would normally trigger a modal popup");
        },
        text: "Add"
    },
    {
        iconProps: {
            iconName: "CheckMark"
        },
        id: "itrp-pm-status-hub-header-approve",
        important: false,
        onActivate: () => {
            alert("This would normally trigger a modal popup");
        },
        text: "Approve item",
        disabled: true
    },
    { id: "separator", itemType: MenuItemType.Divider },
    {
        iconProps: {
            iconName: "Delete"
        },
        id: "itrp-pm-status-hub-header-delete",
        onActivate: () => {
            alert("Example text");
        },
        text: "Delete",
        disabled: true
    }
];
