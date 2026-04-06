import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getMonthName, getRomanMonth, formatRupiah, terbilang } from './helpers.js';

export const generatePDF = async (report, form, getLogoBase64, isPreview = false) => {
    const doc = new jsPDF();

    // Settings
    doc.setFont("helvetica");

    // 1. Header (Logo Text and PO)
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const logoB64 = await getLogoBase64();
    if (logoB64) {
        // Adds the logo specifically at top-left. Ratio is 2410x667 (~3.6)
        doc.addImage(logoB64, "PNG", 14, 10, 43, 12);
    } else {
        doc.text("ASABRI", 14, 20); // Fallback
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`PO: ${form.noPo}`, 180, 20, null, null, "right");

    // 2. Titles
    doc.setFont("helvetica", "bold");
    doc.text("DAFTAR REKAPITULASI PENGELUARAN", 105, 35, null, null, "center");
    doc.setFont("helvetica", "normal");
    doc.text("Rekapitulasi Pengeluaran Divisi Sekretariat Perusahaan", 105, 40, null, null, "center");
    doc.text("PT ASABRI (Persero)", 105, 45, null, null, "center");
    const fullNoRekap = form.noRekap ? `REKAP/KU.02.02/${form.noRekap}/${getRomanMonth(report.month)}/${report.year}-SEKPER` : '';
    doc.text(`Nomor: ${fullNoRekap}`, 105, 50, null, null, "center");

    // 3. Table Data
    const periode = `${getMonthName(report.month)} ${report.year}`;
    const uraian1 = `Rekap Realisasi Biaya Penggunaan Corporate Card Direksi PT ASABRI\n(Persero) Periode Bulan ${periode}, dengan rincian sebagai berikut:\n\n\n${report.director?.position?.toUpperCase()}`;
    const amountStr = formatRupiah(report.totalExpenses);

    autoTable(doc, {
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0], halign: 'center', fontStyle: 'bold' },
        bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [0, 0, 0] },
        head: [['NO', 'URAIAN', 'JUMLAH']],
        body: [
            ['1', uraian1, { content: amountStr, styles: { halign: 'right', valign: 'bottom' } }],
            ['', { content: 'Jumlah Seluruhnya......', styles: { halign: 'center' } }, { content: `Rp ${amountStr}`, styles: { halign: 'right' } }]
        ],
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 40 }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;

    // 4. Terbilang
    const words = terbilang(report.totalExpenses) + " Rupiah";
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(`Terbilang: ${words}`, 14, finalY);

    // 5. Signatures
    doc.setFont("helvetica", "normal");
    doc.text("Menyetujui,", 60, finalY + 25, null, null, "center");

    const now = new Date();
    const dateStr = `${now.getDate()} ${getMonthName(now.getMonth() + 1)} ${now.getFullYear()}`;
    doc.text(`Jakarta, ${dateStr}`, 150, finalY + 25, null, null, "center");

    doc.text(`(${form.jabatanKiri})`, 60, finalY + 35, null, null, "center");
    doc.text(`(${form.jabatanKanan})`, 150, finalY + 35, null, null, "center");

    doc.text(`(${form.namaKiri})`, 60, finalY + 65, null, null, "center");
    doc.text(`(${form.namaKanan})`, 150, finalY + 65, null, null, "center");

    // 6. Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Keterangan: Unit Kerja Telah Memeriksa serta memastikan Keaslian dan Validitas dari Berkas Tagihan", 14, finalY + 80);

    const filename = `Laporan CC ${report.director?.name} ${periode} - ${report.creditCard?.cardNumber.slice(-4)}.pdf`;

    if (isPreview) {
        const blobUrl = doc.output('bloburl');
        const newWin = window.open('', '_blank');
        if (newWin) {
            newWin.document.title = filename;
            newWin.document.write(`
                <html>
                <head><title>${filename}</title></head>
                <body style="margin:0;padding:0;overflow:hidden;">
                    <iframe src="${blobUrl}" style="width:100vw;height:100vh;border:none;"></iframe>
                </body>
                </html>
            `);
            newWin.document.close();
        } else {
            window.open(blobUrl, '_blank');
        }
    } else {
        doc.save(filename);
    }
};
