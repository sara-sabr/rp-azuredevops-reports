import { jsPDF } from "jspdf";

/**
 * Event handler to print the page. As each page inside this extension is wrapped by an
 * iFRAME, printing the body won't print the other UI elements in Azure Boards.
 * For example, the navigation bar and left mmenu as those are also in another IFRAME.
 */
export class PrintPDF {
    public static eventHandlderPrint():void {
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "in",
            format: [8.5, 11]
          });

          pdf.html(document.body).then(() =>
          {
              console.log("printing...")
            pdf.save();
          });

    }
}