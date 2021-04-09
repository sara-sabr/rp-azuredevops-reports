/**
 * Event handler to print the page. As each page inside this extension is wrapped by an
 * iFRAME, printing the body won't print the other UI elements in Azure Boards.
 * For example, the navigation bar and left mmenu as those are also in another IFRAME.
 */
export class PrintPDF {

  /**
   * Print the specified DOM ID.
   *
   * @param domId the DOM ID to print
   */
  public static eventHandlderPrint(domId: string): void {
    // As this in Azure DevOps is called within an IFRAME, only the IFRAME
    // content will be printed.
    //
    window.print();
  }
}
