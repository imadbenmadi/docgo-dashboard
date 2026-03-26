import * as XLSX from "xlsx";

/**
 * Export data to professional Excel file with formatting
 * @param {Array} data - Array of objects to export
 * @param {String} sheetName - Name of the Excel sheet
 * @param {String} fileName - Name of the exported file
 * @param {Object} options - Additional options for formatting
 */
export const exportToExcel = (
  data,
  sheetName = "Export",
  fileName = "export",
  options = {},
) => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const columnWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(
        key.length + 2,
        Math.max(
          ...data.map((row) => {
            const value = row[key];
            return String(value || "").length + 1;
          }),
        ),
      ),
    }));

    worksheet["!cols"] = columnWidths;

    // Style header row
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (headerCell) {
        headerCell.s = {
          fill: {
            fgColor: { rgb: "FF0066CC" }, // Blue background
          },
          font: {
            bold: true,
            color: { rgb: "FFFFFFFF" }, // White text
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
            wrapText: true,
          },
          border: {
            top: { style: "thin", color: { rgb: "FF000000" } },
            bottom: { style: "thin", color: { rgb: "FF000000" } },
            left: { style: "thin", color: { rgb: "FF000000" } },
            right: { style: "thin", color: { rgb: "FF000000" } },
          },
        };
      }
    }

    // Style data rows with alternating colors
    for (let row = 1; row <= headerRange.e.r; row++) {
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell) {
          cell.s = {
            fill: {
              fgColor: {
                rgb: row % 2 === 0 ? "FFF2F2F2" : "FFFFFFFF", // Alternating gray/white
              },
            },
            alignment: {
              horizontal: "left",
              vertical: "center",
              wrapText: true,
            },
            border: {
              top: { style: "thin", color: { rgb: "FFCCCCCC" } },
              bottom: { style: "thin", color: { rgb: "FFCCCCCC" } },
              left: { style: "thin", color: { rgb: "FFCCCCCC" } },
              right: { style: "thin", color: { rgb: "FFCCCCCC" } },
            },
          };
        }
      }
    }

    // Freeze header row
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFileName = `${fileName}_${timestamp}.xlsx`;
    XLSX.writeFile(workbook, finalFileName);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};
