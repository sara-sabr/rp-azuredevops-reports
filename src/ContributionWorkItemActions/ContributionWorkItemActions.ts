import "es6-promise/auto";
import * as SDK from "azure-devops-extension-sdk";
import { WorkItemDependencyChangeListener } from "./WorkItemDependencyChangeListener";

// Register a listener for the work item page contribution.
SDK.register("itrp-wit-dep-action", new WorkItemDependencyChangeListener());
SDK.init();
