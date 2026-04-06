import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CustomSelect({ value, onChange, options, placeholder = "Pilih opsi...", disabled = false }) {
    const [open, setOpen] = useState(false);
    const dropRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropRef.current && !dropRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const handleSelect = (val) => {
        onChange({ target: { value: val } });
        setOpen(false);
    };

    return (
        <div className={`custom-select-wrapper ${disabled ? 'disabled' : ''}`} ref={dropRef}>
            <div
                className={`custom-select-trigger form-control ${open ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setOpen(!open)}
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    opacity: disabled ? 0.6 : 1,
                    background: disabled ? 'var(--color-bg)' : 'var(--color-surface)'
                }}
            >
                <span style={{ color: selectedOption ? 'var(--color-text-primary)' : 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', transition: 'transform var(--transition)', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
            </div>

            {open && !disabled && (
                <div className="custom-select-menu">
                    {options.length === 0 ? (
                        <div className="custom-select-empty">Tidak ada opsi tersedia</div>
                    ) : (
                        options.map((opt) => (
                            <div
                                key={opt.value}
                                className={`custom-select-item ${String(opt.value) === String(value) ? 'active' : ''}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
