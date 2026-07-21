import { jsPDF } from 'jspdf';

function downloadCSV(filename, rows) {
  const csvContent = rows.map(r =>
    r.map(cell => {
      const s = String(cell);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(',')
  ).join('\n');

  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatValue(v) {
  if (v == null || isNaN(Number(v))) return '-';
  return Number(v).toLocaleString();
}

const ReportExport = ({ revenueData = [], forecastData = [] }) => {
  const handleExportCSV = () => {
    const rows = [
      ['Month', 'Revenue (PHP)'],
      ...revenueData.map(d => [d.month, formatValue(d.revenue)]),
      [],
      ['Month', 'Actual Demand', 'Projected Demand (SMA)'],
      ...forecastData.map(d => [
        d.month,
        d.actualDemand != null ? String(d.actualDemand) : '-',
        d.projectedSMA != null ? String(d.projectedSMA) : '-',
      ]),
    ];
    downloadCSV('analytics-report.csv', rows);
  };

  const handleExportPDF = async () => {
    const { default: html2canvas } = await import('html2canvas');

    const doc = new jsPDF('l', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(16);
    doc.text('Analytics Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 22, { align: 'center' });

    let y = 30;

    const captureElement = async (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false });
      return canvas;
    };

    const revenueCanvas = await captureElement('.revenue-chart-container');
    if (revenueCanvas) {
      const imgData = revenueCanvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (imgWidth * revenueCanvas.height) / revenueCanvas.width;
      if (y + imgHeight > pageHeight - 10) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(12);
      doc.text('Revenue Trends', 10, y);
      y += 5;
      doc.addImage(imgData, 'PNG', 10, y, imgWidth, Math.min(imgHeight, 60));
      y += Math.min(imgHeight, 60) + 10;
    }

    const forecastCanvas = await captureElement('.forecast-chart-container');
    if (forecastCanvas) {
      const imgData = forecastCanvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20;
      const imgHeight = (imgWidth * forecastCanvas.height) / forecastCanvas.width;
      if (y + imgHeight > pageHeight - 10) {
        doc.addPage();
        y = 15;
      }
      doc.setFontSize(12);
      doc.text('Demand Forecast (SMA)', 10, y);
      y += 5;
      doc.addImage(imgData, 'PNG', 10, y, imgWidth, Math.min(imgHeight, 60));
      y += Math.min(imgHeight, 60) + 10;
    }

    if (y > pageHeight - 40) {
      doc.addPage();
      y = 15;
    }

    doc.setFontSize(12);
    doc.text('Revenue Summary', 10, y);
    y += 6;

    const tableHeaders = ['Month', 'Revenue (PHP)'];
    const tableRows = revenueData.map(d => [d.month, formatValue(d.revenue)]);

    doc.setFontSize(8);
    const colW = 40;
    const rowH = 5;

    doc.setFont('helvetica', 'bold');
    tableHeaders.forEach((h, i) => {
      doc.text(h, 10 + i * colW, y);
    });
    y += rowH;

    doc.setFont('helvetica', 'normal');
    tableRows.forEach(row => {
      if (y > pageHeight - 10) {
        doc.addPage();
        y = 15;
        doc.setFont('helvetica', 'bold');
        tableHeaders.forEach((h, i) => {
          doc.text(h, 10 + i * colW, y);
        });
        y += rowH;
        doc.setFont('helvetica', 'normal');
      }
      row.forEach((cell, i) => {
        doc.text(String(cell), 10 + i * colW, y);
      });
      y += rowH;
    });

    if (forecastData.length > 0) {
      y += 4;
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 15;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Demand Forecast Summary', 10, y);
      y += 6;

      const fHeaders = ['Month', 'Actual Demand', 'Projected (SMA)'];
      const fRows = forecastData.map(d => [
        d.month,
        d.actualDemand != null ? String(d.actualDemand) : '-',
        d.projectedSMA != null ? String(d.projectedSMA) : '-',
      ]);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      fHeaders.forEach((h, i) => {
        doc.text(h, 10 + i * colW, y);
      });
      y += rowH;

      doc.setFont('helvetica', 'normal');
      fRows.forEach(row => {
        if (y > pageHeight - 10) {
          doc.addPage();
          y = 15;
          doc.setFont('helvetica', 'bold');
          fHeaders.forEach((h, i) => {
            doc.text(h, 10 + i * colW, y);
          });
          y += rowH;
          doc.setFont('helvetica', 'normal');
        }
        row.forEach((cell, i) => {
          doc.text(String(cell), 10 + i * colW, y);
        });
        y += rowH;
      });
    }

    doc.save('analytics-report.pdf');
  };

  return (
    <div className="flex gap-3 mb-4">
      <button
        onClick={handleExportCSV}
        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
      >
        Export CSV
      </button>
      <button
        onClick={handleExportPDF}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
      >
        Export PDF
      </button>
    </div>
  );
};

export default ReportExport;
