export const MONTH_NAMES = {
    1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
    5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
    9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember',
};

export function getMonthName(month) {
    return MONTH_NAMES[Number(month)] || '';
}

const ROMAN_MONTHS = {
    1: 'I', 2: 'II', 3: 'III', 4: 'IV',
    5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII',
    9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};

export function getRomanMonth(month) {
    return ROMAN_MONTHS[Number(month)] || '';
}

export function formatRupiah(amount) {
    return Number(amount).toLocaleString('id-ID');
}

export function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function getErrorMessage(error) {
    return (
        error?.response?.data?.message ||
        error?.message ||
        'An unexpected error occurred.'
    );
}

export function getReportSlug(report) {
    if (!report || !report.director || !report.creditCard) return '';
    const nameSlug = report.director.name.toLowerCase().replace(/\s+/g, '-');
    const m = String(report.month).padStart(2, '0');
    const y = report.year;
    const last4 = report.creditCard.cardNumber.slice(-4);
    return `/reports/${nameSlug}/${m}/${y}/${last4}`;
}

export function terbilang(angka) {
    if (angka === 0) return "Nol";
    const angkaLabel = ["", " Satu", " Dua", " Tiga", " Empat", " Lima", " Enam", " Tujuh", " Delapan", " Sembilan", " Sepuluh", " Sebelas"];

    function parse(n) {
        let hasil = "";
        if (n < 12) {
            hasil = angkaLabel[n];
        } else if (n < 20) {
            hasil = parse(n - 10) + " Belas";
        } else if (n < 100) {
            hasil = parse(Math.floor(n / 10)) + " Puluh" + parse(n % 10);
        } else if (n < 200) {
            hasil = " Seratus" + parse(n - 100);
        } else if (n < 1000) {
            hasil = parse(Math.floor(n / 100)) + " Ratus" + parse(n % 100);
        } else if (n < 2000) {
            hasil = " Seribu" + parse(n - 1000);
        } else if (n < 1000000) {
            hasil = parse(Math.floor(n / 1000)) + " Ribu" + parse(n % 1000);
        } else if (n < 1000000000) {
            hasil = parse(Math.floor(n / 1000000)) + " Juta" + parse(n % 1000000);
        } else if (n < 1000000000000) {
            hasil = parse(Math.floor(n / 1000000000)) + " Miliar" + parse(n % 1000000000);
        } else if (n < 1000000000000000) {
            hasil = parse(Math.floor(n / 1000000000000)) + " Triliun" + parse(n % 1000000000000);
        }
        return hasil;
    }

    return parse(angka).trim();
}
