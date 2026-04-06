import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, Eye } from 'lucide-react';
import { reportsApi } from '../api/axios.js';
import { getMonthName, getRomanMonth, formatRupiah, terbilang } from '../utils/helpers.js';

import { generatePDF } from '../utils/exportPdf.js';
import { generateExcel } from '../utils/exportExcel.js';

export default function ExportModal({ report, onClose }) {
    const [exporting, setExporting] = useState(false);

    // New Form Fields
    const [form, setForm] = useState({
        noRekap: '',
        noPo: '',
        jabatanKiri: '',
        jabatanKanan: '',
        namaKiri: '',
        namaKanan: ''
    });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const getLogoBase64 = async () => {
        try {
            const response = await fetch('/logo.png');
            const blob = await response.blob();
            return await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return null; // Fallback silently
        }
    };

    const handleAction = async (type) => {
        setExporting(true);
        try {
            if (type === 'preview') {
                await generatePDF(report, form, getLogoBase64, true);
            } else if (type === 'pdf') {
                await generatePDF(report, form, getLogoBase64, false);
                await reportsApi.logExport(report.id, 'pdf');
                onClose();
            } else if (type === 'excel') {
                await generateExcel(report, form, getLogoBase64);
                await reportsApi.logExport(report.id, 'excel');
                onClose();
            }
        } catch (err) {
            alert(err.message || 'An error occurred during export.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={!exporting ? onClose : undefined}>
            <div className="modal modal-md" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="modal-title" style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Ekspor & Pratinjau</h2>
                    <button onClick={onClose} className="btn-icon" disabled={exporting}>
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body" style={{ paddingTop: 20, paddingBottom: 24 }}>
                    <div className="export-form-grid" style={{
                        display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, padding: 16, background: 'var(--color-bg)', borderRadius: 'var(--radius)'
                    }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Nomor Rekap</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0 8px' }}>
                                    <span style={{ fontSize: 13, color: 'var(--color-border)' }}>REKAP/.../</span>
                                    <input type="text" name="noRekap" value={form.noRekap} onChange={handleChange} style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 4px', fontSize: 13, width: '100%', color: 'var(--color-text)' }} placeholder="123" />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Nomor PO</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0 8px' }}>
                                    <input type="text" name="noPo" value={form.noPo} onChange={handleChange} style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 4px', fontSize: 13, width: '100%', color: 'var(--color-text)' }} placeholder="PO-0001" />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Jabatan Penandatangan Kiri</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0 8px' }}>
                                    <input type="text" name="jabatanKiri" value={form.jabatanKiri} onChange={handleChange} style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 4px', fontSize: 13, width: '100%', color: 'var(--color-text)' }} placeholder="Cth: Mengetahui" />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Jabatan Penandatangan Kanan</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0 8px' }}>
                                    <input type="text" name="jabatanKanan" value={form.jabatanKanan} onChange={handleChange} style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 4px', fontSize: 13, width: '100%', color: 'var(--color-text)' }} placeholder="Cth: Menyetujui" />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Nama Penandatangan Kiri</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0 8px' }}>
                                    <input type="text" name="namaKiri" value={form.namaKiri} onChange={handleChange} style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 4px', fontSize: 13, width: '100%', color: 'var(--color-text)' }} placeholder="Nama..." />
                                </div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 6 }}>Nama Penandatangan Kanan</label>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', padding: '0 8px' }}>
                                    <input type="text" name="namaKanan" value={form.namaKanan} onChange={handleChange} style={{ border: 'none', background: 'transparent', outline: 'none', padding: '10px 4px', fontSize: 13, width: '100%', color: 'var(--color-text)' }} placeholder="Nama..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                        <button
                            className="btn"
                            style={{ flex: 1, backgroundColor: '#dc3545', color: '#fff' }}
                            onClick={() => handleAction('pdf')} disabled={exporting}>
                            <FileText size={16} style={{ marginRight: 6 }} /> PDF
                        </button>
                        <button
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={() => handleAction('preview')} disabled={exporting}>
                            <Eye size={16} style={{ marginRight: 6 }} /> Pratinjau
                        </button>
                        <button
                            className="btn"
                            style={{ flex: 1, backgroundColor: '#198754', color: '#fff' }}
                            onClick={() => handleAction('excel')} disabled={exporting}>
                            <FileSpreadsheet size={16} style={{ marginRight: 6 }} /> Excel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
