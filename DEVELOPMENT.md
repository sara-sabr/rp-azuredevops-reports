# Development Information

This file lists all reference material that is of use during the development of this extension.

**Table of Contents**
- [Development Information](#development-information)
  - [Microsoft documentation](#microsoft-documentation)
  - [Sample code](#sample-code)

## Microsoft documentation

- [Manifest Information](https://docs.microsoft.com/en-us/azure/devops/extend/develop/manifest?view=azure-devops)
The manifest provides the extension integration points into Azure DevOps and the Marketplace.

- [Contribution Targets](https://docs.microsoft.com/en-us/previous-versions/azure/devops/extend/reference/targets/overview#targets)
Lists all the locations (not exhaustive) in Azure DevOps that you can extend or attach to.

- [Shift from VSS SDK and Azure SDK](https://github.com/microsoft/azure-devops-extension-sdk/issues/10)
The latest SDK to use for an extension as Azure DevOps Extension SDK is promoted in favor of Visual Studio SDK.

- [UI Compontents](https://developer.microsoft.com/en-gb/azure-devops/components)
The Formula Design System provides common UI widgets for Azure DevOps extensions as well as design recommendations.

## Sample code

- [Azure DevOps Web Sample Extension](https://github.com/microsoft/azure-devops-extension-sample)
Repository of examples that leverage the Azure DevOps Extension SDK.

- [Azure DevOps Extension Hot Reload and Debug](https://github.com/microsoft/azure-devops-extension-hot-reload-and-debug)
How to create a hot reloable plugin for different environments. This extension leverages the configuration listed with some customizations.

- [Visual Studio Team Services (VSTS) Sample Extensions](https://github.com/microsoft/vsts-extension-samples)
Repository of examples which are better used as an idea of how to approach problems then actual code references as this uses the VSS SDK.