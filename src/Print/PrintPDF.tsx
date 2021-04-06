import { jsPDF, HTMLWorker } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Event handler to print the page. As each page inside this extension is wrapped by an
 * iFRAME, printing the body won't print the other UI elements in Azure Boards.
 * For example, the navigation bar and left mmenu as those are also in another IFRAME.
 */
export class PrintPDF {
  public static async eventHandlderPrint(): Promise<void> {
    (window as any).html2canvas = html2canvas;

    var pdf = new jsPDF("p", "pt", "letter");
    // const pdf = new jsPDF({
    //     orientation: "portrait",
    //     unit: "in",
    //     format: [8.5, 11]
    //   });

    var content = document.getElementById("root");

    if (content) {
      pdf.html(content, {
        callback: function(pdf) {
          pdf.save("cv-a4.pdf");
        }
      });
    }
  }
}
