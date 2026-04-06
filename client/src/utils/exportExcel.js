import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getMonthName, getRomanMonth, formatRupiah, terbilang } from "./helpers.js";

export const generateExcel = async (report, form, getLogoBase64) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rekapitulasi");

    workbook.creator = "System";
    workbook.created = new Date();

    // 4-COLUMN LAYOUT (Total Width = 86)
    // Left half (A+B) = 43, Right half (C+D) = 43. Perfect symmetry!
    worksheet.columns = [
        { width: 5 },  // A: NO
        { width: 38 }, // B: URAIAN (Left)
        { width: 24 }, // C: URAIAN (Right)
        { width: 19 }  // D: JUMLAH
    ];

    const safeMonth = report.month || new Date().getMonth() + 1;
    const safeYear = report.year || new Date().getFullYear();
    const period = `${getMonthName(safeMonth)} ${safeYear}`;
    const fullNoRekap = form.noRekap ? `REKAP/KU.02.02/${form.noRekap}/${getRomanMonth(safeMonth)}/${safeYear}-SEKPER` : '';

    const total = report.totalExpenses || 0;
    const amountString = formatRupiah(total);
    const amountInWords = terbilang(total) + " Rupiah";

    const directorPosition = (report.director?.position || "").toUpperCase();

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${getMonthName(
        currentDate.getMonth() + 1
    )} ${currentDate.getFullYear()}`;

    // ===== LOGO =====
    const logoBase64 = await getLogoBase64();

    if (logoBase64) {
        const base64 = logoBase64.split(",")[1];

        const imageId = workbook.addImage({
            base64,
            extension: "png"
        });

        worksheet.addImage(imageId, {
            tl: { col: 0.2, row: 0.2 },
            // Ratio 2410x667 approx 3.6:1
            ext: { width: 126, height: 35 }
        });
    }

    // ===== SPACING & PO NUMBER =====
    worksheet.addRow([]);
    const poRow = worksheet.addRow(["", "", "", `PO: ${form.noPo || ""}`]);
    poRow.getCell(4).alignment = { horizontal: "right", vertical: "middle" };
    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    // ===== HEADER =====
    const r6 = worksheet.addRow(["DAFTAR REKAPITULASI PENGELUARAN"]);
    worksheet.mergeCells(`A${r6.number}:D${r6.number}`);
    r6.getCell(1).font = { bold: true, size: 12 };
    r6.getCell(1).alignment = { horizontal: "center" };

    const r7 = worksheet.addRow(["Rekapitulasi Pengeluaran Divisi Sekretariat Perusahaan"]);
    worksheet.mergeCells(`A${r7.number}:D${r7.number}`);
    r7.getCell(1).alignment = { horizontal: "center" };

    const r8 = worksheet.addRow(["PT ASABRI (Persero)"]);
    worksheet.mergeCells(`A${r8.number}:D${r8.number}`);
    r8.getCell(1).alignment = { horizontal: "center" };

    const r9 = worksheet.addRow([`Nomor: ${fullNoRekap}`]);
    worksheet.mergeCells(`A${r9.number}:D${r9.number}`);
    r9.getCell(1).alignment = { horizontal: "center" };

    worksheet.addRow([]);

    // ===== TABLE HEADER =====
    const header = worksheet.addRow(["NO", "URAIAN", "", "JUMLAH"]);
    worksheet.mergeCells(`B${header.number}:C${header.number}`);

    header.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });

    header.height = 22;

    // ===== TABLE CONTENT =====
    const description = `Rekap Realisasi Biaya Penggunaan Corporate Card Direksi PT ASABRI (Persero) Periode Bulan ${period}, dengan rincian sebagai berikut:\n\n${directorPosition}`;

    const row = worksheet.addRow([
        1,
        description,
        "",
        `Rp ${amountString}`
    ]);
    worksheet.mergeCells(`B${row.number}:C${row.number}`);

    row.getCell(1).alignment = { horizontal: "center", vertical: "top" };
    row.getCell(2).alignment = { wrapText: true, vertical: "top" };
    row.getCell(4).alignment = { horizontal: "right", vertical: "bottom" }; // Align bottom!

    row.height = 110; // Increased height so text doesn't cut off

    [1, 2, 4].forEach(colIdx => {
        row.getCell(colIdx).border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });

    // ===== TOTAL =====
    const totalRow = worksheet.addRow(["", "Jumlah Seluruhnya.....", "", `Rp ${amountString}`]);
    worksheet.mergeCells(`B${totalRow.number}:C${totalRow.number}`);

    totalRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
    totalRow.getCell(4).alignment = { horizontal: "right", vertical: "middle" };

    [1, 2, 4].forEach(colIdx => {
        totalRow.getCell(colIdx).border = { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } };
    });

    // ===== TERBILANG =====
    worksheet.addRow([]);

    const terbilangRow = worksheet.addRow([`Terbilang: ${amountInWords}`]);
    worksheet.mergeCells(`A${terbilangRow.number}:D${terbilangRow.number}`);
    terbilangRow.getCell(1).font = { italic: true };

    // ===== SIGNATURE =====
    worksheet.addRow([]);
    worksheet.addRow([]);

    const signRow = worksheet.addRow(["Menyetujui,", "", `Jakarta, ${formattedDate}`, ""]);
    worksheet.mergeCells(`A${signRow.number}:B${signRow.number}`);
    worksheet.mergeCells(`C${signRow.number}:D${signRow.number}`);
    signRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    signRow.getCell(3).alignment = { horizontal: "center", vertical: "middle" };

    const sign1Row = worksheet.addRow([`(${form.jabatanKiri || ""})`, "", `(${form.jabatanKanan || ""})`, ""]);
    worksheet.mergeCells(`A${sign1Row.number}:B${sign1Row.number}`);
    worksheet.mergeCells(`C${sign1Row.number}:D${sign1Row.number}`);
    sign1Row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    sign1Row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };

    worksheet.addRow([]);
    worksheet.addRow([]);

    const sign2Row = worksheet.addRow([`(${form.namaKiri || ""})`, "", `(${form.namaKanan || ""})`, ""]);
    worksheet.mergeCells(`A${sign2Row.number}:B${sign2Row.number}`);
    worksheet.mergeCells(`C${sign2Row.number}:D${sign2Row.number}`);
    sign2Row.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
    sign2Row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };

    // ===== FOOTER =====
    worksheet.addRow([]);
    worksheet.addRow([]);

    const note = worksheet.addRow(["Keterangan: Unit Kerja Telah Memeriksa serta memastikan Keaslian dan Validitas dari Berkas Tagihan"]);
    worksheet.mergeCells(`A${note.number}:D${note.number}`);
    note.getCell(1).font = { bold: true, size: 10 };

    // ===== EXPORT =====
    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const directorName = report.director?.name || "Unknown";
    const cardNumber = report.creditCard?.cardNumber
        ? report.creditCard.cardNumber.slice(-4)
        : "XXXX";

    saveAs(
        blob,
        `Laporan CC ${directorName} ${period} - ${cardNumber}.xlsx`
    );
};