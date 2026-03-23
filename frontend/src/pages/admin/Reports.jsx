import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReportsContent from "../../components/admin/ReportsContent";

async function downloadReport() {
  const reportElement = document.getElementById("report-content");

  if (!reportElement) return;

  const canvas = await html2canvas(reportElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#08111f"
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Additional pages
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save("career-guidance-report.pdf");
}

function Reports() {
  return (
    <section className="space-y-6 p-4">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
            Admin Reports
          </p>

          <h2 className="mt-2 text-3xl font-semibold text-white">
            Downloadable reporting workspace
          </h2>
        </div>

        {/* Download Button */}
        <button
          onClick={downloadReport}
          className="bg-blue-500 hover:bg-blue-600 transition text-white px-4 py-2 rounded-lg shadow-lg"
        >
          Download Report
        </button>

      </div>

      {/* Report Content */}
      <div
        id="report-content"
        className="rounded-[32px] border border-white/10 bg-[#08111f] p-6 shadow-2xl shadow-slate-950/40"
      >
        <ReportsContent />
      </div>

    </section>
  );
}

export default Reports;