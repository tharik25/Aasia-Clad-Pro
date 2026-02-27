import React, { useMemo, useState } from 'react';
import {
    FileText, Plus, X, Save, Send, CheckCircle2, XCircle,
    ChevronDown, ChevronUp, History, AlertTriangle, Lock, Edit, Trash2, Clock
} from 'lucide-react';
import { useStore } from '../store/useStore';

// ── Client Response Codes ─────────────────────────────────────────────────────
const CLIENT_CODES = {
    '1': { label: 'Code 1 – Approved', color: '#34d399', bg: 'rgba(52,211,153,0.1)', short: '1' },
    '2': { label: 'Code 2 – Revise & Resubmit (Work May Proceed)', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', short: '2' },
    '3': { label: 'Code 3 – Revise & Resubmit (Work May NOT Proceed)', color: '#f87171', bg: 'rgba(248,113,113,0.1)', short: '3' },
    '4': { label: 'Code 4 – Review Not Required (Work May Proceed)', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', short: '4' },
    'D': { label: 'Code D – For Information Only', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', short: 'D' },
};

// ── Document Status Config ────────────────────────────────────────────────────
const STATUS_CONFIG = {
    'DRAFT': { color: 'var(--text-muted)', bg: 'rgba(148,163,184,0.1)', label: 'Draft' },
    'SUBMITTED': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Submitted – Awaiting Review' },
    'PENDING-REV0': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Code 1 Received – Submit Rev 0' },
    'CODE-2': { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Code 2 – Revise & Resubmit' },
    'CODE-3': { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Code 3 – Work May NOT Proceed' },
    'CODE-4': { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Code 4 – Work May Proceed' },
    'CODE-D': { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Code D – For Information Only' },
    'APPROVED': { color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: '✓ APPROVED (Rev 0 Code 1)' },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['DRAFT'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.color}55`,
            borderRadius: '999px', padding: '0.18rem 0.7rem',
            fontSize: '0.76rem', fontWeight: 600, whiteSpace: 'nowrap',
        }}>{cfg.label}</span>
    );
};

const CodeBadge = ({ code }) => {
    if (!code) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    const cfg = CLIENT_CODES[code];
    if (!cfg) return <span>{code}</span>;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: '50%',
            background: cfg.bg, color: cfg.color,
            border: `1.5px solid ${cfg.color}55`,
            fontWeight: 800, fontSize: '0.82rem',
        }} title={cfg.label}>{cfg.short}</span>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const NMRPage = () => {
    const {
        projects, purchaseOrders, poLineItems, products, nmrDocuments,
        addNmrDocument, updateNmrDocument, deleteNmrDocument,
        submitNmrForReview, submitNmrRev0, recordNmrClientResponse, resetNmrToDraft
    } = useStore();

    const [filterProjectId, setFilterProjectId] = useState('');
    const [filterPOId, setFilterPOId] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editingNmr, setEditingNmr] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [submitDialog, setSubmitDialog] = useState(null);
    const [responseDialog, setResponseDialog] = useState(null);
    const [lineItemToAddId, setLineItemToAddId] = useState('');
    const initialForm = {
        projectId: '', poId: '', lineItemIds: [],
        lineItemProducts: {},
        drawingNumber: '', drawingRevision: 'A', drawingTitle: '',
        specification: '', remarks: '',
        refDrawingNo: '',      // Reference Drawing No (Text)
    };
    const [form, setForm] = useState(initialForm);

    // ── Derived lookups ──────────────────────────────────────────────────────
    const selectedLineItems = form.lineItemIds
        .map(id => poLineItems.find(li => li.id === id))
        .filter(Boolean);
    const projectPOs = purchaseOrders.filter(po => po.projectId === form.projectId);
    const drawingRevisionOptions = useMemo(
        () => Array.from(new Set(['A', 'B', '0', ...nmrDocuments.map(n => n.drawingRevision).filter(Boolean)])),
        [nmrDocuments]
    );
    const isEditing = !!editingNmr;

    const existingNmrLineItemIds = nmrDocuments
        .filter(n => !editingNmr || n.id !== editingNmr.id)
        .flatMap(n => n.lineItemIds || []);

    const availableLineItems = poLineItems
        .filter(li => li.poId === form.poId && !existingNmrLineItemIds.includes(li.id));
    const addableLineItems = availableLineItems.filter(li => !form.lineItemIds.includes(li.id));

    const isCladdedSpool = (category) => {
        const val = (category || '').toLowerCase();
        return val.includes('cladded spool') || val.includes('spool');
    };
    const isAutoDrawing = selectedLineItems.length > 0 && selectedLineItems.every(li => isCladdedSpool(li.itemCategory));
    const autoDrawingNumber = isAutoDrawing && selectedLineItems[0]?.poLineItemNumber
        ? `AS-CL-${selectedLineItems[0].poLineItemNumber}000`
        : '';
    const effectiveDrawingNumber = isAutoDrawing ? autoDrawingNumber : form.drawingNumber;
    const isDrawingDuplicate = nmrDocuments.some(
        n => (!editingNmr || n.id !== editingNmr.id) &&
            (n.drawingNumber || '').trim().toLowerCase() === (effectiveDrawingNumber || '').trim().toLowerCase()
    );

    // ── Filtered list ────────────────────────────────────────────────────────
    const filteredNmrs = nmrDocuments.filter(n => {
        if (filterProjectId && n.projectId !== filterProjectId) return false;
        if (filterPOId && n.poId !== filterPOId) return false;
        return true;
    });

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (form.lineItemIds.length === 0) {
            alert('Please select at least one line item.');
            return;
        }
        const hasMissingProducts = form.lineItemIds.some(id => !form.lineItemProducts?.[id]);
        if (hasMissingProducts) {
            alert('Please select product for each selected line item.');
            return;
        }
        const finalDrawingNumber = effectiveDrawingNumber;

        if (!finalDrawingNumber.trim()) {
            alert('Please enter a drawing number.');
            return;
        }
        const drawingAlreadyUsed = nmrDocuments.some(
            n => (!editingNmr || n.id !== editingNmr.id) &&
                (n.drawingNumber || '').trim().toLowerCase() === finalDrawingNumber.trim().toLowerCase()
        );
        if (drawingAlreadyUsed) {
            alert('Duplicate Drawing Number is not allowed.');
            return;
        }
        const conflictedLineItems = form.lineItemIds.filter(id => existingNmrLineItemIds.includes(id));
        if (conflictedLineItems.length > 0) {
            alert('One or more PO line items are already linked to another NMR.');
            return;
        }

        const payload = {
            ...form,
            drawingNumber: finalDrawingNumber,
            // We store the lineItemIds array. Details will be pulled dynamically in the table.
        };
        if (editingNmr) updateNmrDocument(editingNmr.id, payload);
        else addNmrDocument(payload);
        resetForm();
    };

    const handleEdit = (nmr) => {
        setEditingNmr(nmr);
        setForm({
            projectId: nmr.projectId, poId: nmr.poId, lineItemIds: nmr.lineItemIds || [],
            lineItemProducts: nmr.lineItemProducts || Object.fromEntries((nmr.lineItemIds || []).map(id => [id, nmr.productId || ''])),
            drawingNumber: nmr.drawingNumber || '', drawingRevision: nmr.drawingRevision || '',
            drawingTitle: nmr.drawingTitle || '', specification: nmr.specification || '',
            remarks: nmr.remarks || '',
            refDrawingNo: nmr.refDrawingNo || '',
        });
        setLineItemToAddId('');
        setShowCreate(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this NMR document? This cannot be undone.')) {
            deleteNmrDocument(id);
            if (expandedRow === id) setExpandedRow(null);
        }
    };

    const resetForm = () => {
        setShowCreate(false);
        setEditingNmr(null);
        setForm(initialForm);
        setLineItemToAddId('');
    };

    const isLocked = (nmr) => nmr.status === 'APPROVED' || nmr.status === 'CODE-4' || nmr.status === 'CODE-D';

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="page-container animate-fade-in">

            {/* ── Page Header ──────────────────────────────────────────── */}
            <div className="page-header">
                <div>
                    <h2>NMR Documents</h2>
                    <p className="subtitle">Non-Material Requirements — revision-controlled, CODE 1 client approval required before production may proceed.</p>
                </div>
                {!showCreate && (
                    <button className="btn-primary" onClick={() => setShowCreate(true)}>
                        <Plus size={18} /> New NMR
                    </button>
                )}
            </div>

            {/* ── Code Legend ───────────────────────────────────────────── */}
            <div className="glass-panel" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Client Codes:</span>
                {Object.entries(CLIENT_CODES).map(([key, cfg]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <CodeBadge code={key} />
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.76rem' }}>{cfg.label.replace(`Code ${key} – `, '')}</span>
                    </div>
                ))}
            </div>

            {/* ── Filter Bar ────────────────────────────────────────────── */}
            <div className="glass-panel" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <select className="premium-input select-input" style={{ width: '220px' }} value={filterProjectId}
                    onChange={e => { setFilterProjectId(e.target.value); setFilterPOId(''); }}>
                    <option value="">— All Projects —</option>
                    {projects.map(p => (<option key={p.id} value={p.id}>{p.id} · {Array.isArray(p.name) ? p.name.join(', ') : p.name}</option>))}
                </select>
                <select className="premium-input select-input" style={{ width: '200px' }} value={filterPOId}
                    onChange={e => setFilterPOId(e.target.value)} disabled={!filterProjectId}>
                    <option value="">— All POs —</option>
                    {purchaseOrders.filter(po => po.projectId === filterProjectId).map(po => (
                        <option key={po.id} value={po.id}>{po.poNumber}</option>
                    ))}
                </select>
                <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {filteredNmrs.length} document{filteredNmrs.length !== 1 ? 's' : ''}
                    {' · '}{filteredNmrs.filter(n => n.status === 'APPROVED').length} approved
                    {' · '}{filteredNmrs.filter(n => n.status !== 'APPROVED' && n.status !== 'CODE-4' && n.status !== 'CODE-D').length} pending
                </span>
            </div>

            {/* ── Create / Edit Form ────────────────────────────────────── */}
            {showCreate && (
                <div className="glass-panel create-form-panel animate-fade-in" style={{ borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
                    <div className="form-header">
                        <h3>{editingNmr ? `Edit NMR: ${editingNmr.drawingNumber} Rev ${editingNmr.revision}` : 'Create New NMR Document'}</h3>
                        <button className="icon-btn-small" onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleSubmitForm} className="so-form">
                        {/* 1 · Project & PO */}
                        <h5 style={{ color: 'var(--text-secondary)', margin: '0 0 1rem' }}>1 · Project &amp; PO</h5>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Project</label>
                                <select className="premium-input select-input" value={form.projectId}
                                    onChange={e => setForm({ ...form, projectId: e.target.value, poId: '', lineItemIds: [], lineItemProducts: {} })} required>
                                    <option value="">— Select Project —</option>
                                    {projects.map(p => (<option key={p.id} value={p.id}>{p.id} · {Array.isArray(p.name) ? p.name.join(', ') : p.name}</option>))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Purchase Order</label>
                                <select className="premium-input select-input" value={form.poId}
                                    onChange={e => setForm({ ...form, poId: e.target.value, lineItemIds: [], lineItemProducts: {} })} required disabled={!form.projectId}>
                                    <option value="">— Select PO —</option>
                                    {projectPOs.map(po => (<option key={po.id} value={po.id}>{po.poNumber} (Rev {po.poRev})</option>))}
                                </select>
                            </div>
                        </div>

                        {/* 2 · Drawing Details */}
                        <h5 style={{ color: 'var(--text-secondary)', margin: '1.5rem 0 1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>2 · Drawing Details</h5>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Drawing Number</label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    value={isAutoDrawing ? autoDrawingNumber : form.drawingNumber}
                                    onChange={e => setForm({ ...form, drawingNumber: e.target.value })}
                                    placeholder={isAutoDrawing ? 'Auto for Cladded Spool line items' : 'e.g. AS-CL-10000'}
                                    required
                                    disabled={isAutoDrawing}
                                />
                                {isAutoDrawing && (
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                        Auto format `AS-CL-X000` (X = first selected PO line item number).
                                    </p>
                                )}
                                {isDrawingDuplicate && (
                                    <p style={{ fontSize: '0.72rem', color: 'var(--danger)', marginTop: '0.35rem' }}>
                                        This drawing number already exists.
                                    </p>
                                )}
                            </div>
                            <div className="input-group"><label className="input-label">Drawing Revision</label>
                                <select className="premium-input select-input" value={form.drawingRevision}
                                    onChange={e => setForm({ ...form, drawingRevision: e.target.value })}>
                                    {drawingRevisionOptions.map(rev => (
                                        <option key={rev} value={rev}>{rev}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">Reference Drawing No.</label>
                                <input type="text" className="premium-input" value={form.refDrawingNo}
                                    onChange={e => setForm({ ...form, refDrawingNo: e.target.value })} placeholder="Reference drawing number" />
                            </div>
                        </div>

                        {/* 3 · Select PO Line Items */}
                        <h5 style={{ color: 'var(--text-secondary)', margin: '1.5rem 0 1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>3 · Select PO Line Items</h5>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="form-grid" style={{ marginBottom: '0.8rem' }}>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">PO Line Item Number</label>
                                    <select className="premium-input select-input" value={lineItemToAddId}
                                        onChange={e => setLineItemToAddId(e.target.value)} disabled={!form.poId || addableLineItems.length === 0}>
                                        <option value="">— Select PO Line Item —</option>
                                        {addableLineItems.map(li => (
                                            <option key={li.id} value={li.id}>#{li.poLineItemNumber} · {li.itemCategory}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.6rem' }}>
                                <button type="button" className="btn-secondary" disabled={!lineItemToAddId}
                                    onClick={() => {
                                        if (!lineItemToAddId || form.lineItemIds.includes(lineItemToAddId)) return;
                                        setForm({
                                            ...form,
                                            lineItemIds: [...form.lineItemIds, lineItemToAddId],
                                            lineItemProducts: { ...form.lineItemProducts, [lineItemToAddId]: form.lineItemProducts?.[lineItemToAddId] || '' }
                                        });
                                        setLineItemToAddId('');
                                    }}>
                                    <Plus size={14} /> Add Line Item
                                </button>
                            </div>
                            <div className="table-container" style={{ border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>PO Line Item</th>
                                            <th>Category</th>
                                            <th>Size</th>
                                            <th>WT</th>
                                            <th>Qty</th>
                                            <th>Delivery Date</th>
                                            <th>Product</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedLineItems.length === 0 && (
                                            <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                                                No line items selected.
                                            </td></tr>
                                        )}
                                        {selectedLineItems.map(li => (
                                            <tr key={li.id}>
                                                <td>#{li.poLineItemNumber}</td>
                                                <td>{li.itemCategory || '—'}</td>
                                                <td>{li.size || '—'}</td>
                                                <td>{li.wt || '—'}</td>
                                                <td>{li.quantity || '—'}</td>
                                                <td>{li.deliveryDate || '—'}</td>
                                                <td style={{ minWidth: '260px' }}>
                                                    <select
                                                        className="premium-input select-input"
                                                        value={form.lineItemProducts?.[li.id] || ''}
                                                        onChange={e => setForm({
                                                            ...form,
                                                            lineItemProducts: { ...form.lineItemProducts, [li.id]: e.target.value }
                                                        })}
                                                        required
                                                    >
                                                        <option value="">— Select Product —</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.code} · {p.name} [{p.category}]</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ width: '70px' }}>
                                                    <button type="button" className="icon-btn-small" style={{ color: 'var(--danger)' }}
                                                        onClick={() => {
                                                            const newProducts = { ...(form.lineItemProducts || {}) };
                                                            delete newProducts[li.id];
                                                            setForm({
                                                                ...form,
                                                                lineItemIds: form.lineItemIds.filter(id => id !== li.id),
                                                                lineItemProducts: newProducts
                                                            });
                                                        }}>
                                                        <X size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                PO line items are globally locked once linked to an NMR.
                            </p>
                        </div>

                        {/* 4 · Additional */}
                        <h5 style={{ color: 'var(--text-secondary)', margin: '1.5rem 0 1rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>4 · Additional</h5>
                        <div className="form-grid">
                            <div className="input-group" style={{ gridColumn: 'span 2' }}><label className="input-label">Drawing Title</label>
                                <input type="text" className="premium-input" value={form.drawingTitle} onChange={e => setForm({ ...form, drawingTitle: e.target.value })} placeholder="e.g. Assembly Detail – Cladded Pipe Spool" /></div>
                            <div className="input-group"><label className="input-label">Specification / Standard</label>
                                <input type="text" className="premium-input" value={form.specification} onChange={e => setForm({ ...form, specification: e.target.value })} placeholder="e.g. ASME B31.3" /></div>
                            <div className="input-group"><label className="input-label">Remarks</label>
                                <input type="text" className="premium-input" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></div>
                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="btn-primary"><Save size={18} /> {isEditing ? 'Update NMR' : 'Create NMR Document'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* ── NMR Table ─────────────────────────────────────────────── */}
            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Drawing No.</th>
                            <th>Rev</th>
                            <th>Status</th>
                            <th>Project / PO</th>
                            <th>Line Items</th>
                            <th>Line Item Details</th>
                            <th>Product</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredNmrs.map(nmr => {
                            const isExpanded = expandedRow === nmr.id;
                            const locked = isLocked(nmr);
                            const proj = projects.find(p => p.id === nmr.projectId);
                            const po = purchaseOrders.find(po => po.id === nmr.poId);

                            return (
                                <React.Fragment key={nmr.id}>
                                    <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedRow(isExpanded ? null : nmr.id)}>
                                        <td>{isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-primary)', whiteSpace: 'nowrap' }}>
                                            {nmr.drawingNumber || '—'}
                                            {nmr.drawingRevision && <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: '0.4rem' }}>({nmr.drawingRevision})</span>}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 800, color: nmr.revision === '0' ? '#34d399' : nmr.revision > 'A' ? '#f59e0b' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                Rev {nmr.revision}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={nmr.status} /></td>
                                        <td style={{ fontSize: '0.82rem' }}>
                                            <div style={{ fontWeight: 600 }}>{proj?.id || nmr.projectId}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>{po?.poNumber || nmr.poId}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                                {nmr.lineItemIds?.map(id => {
                                                    const li = poLineItems.find(l => l.id === id);
                                                    return <span key={id} className="badge badge-info" style={{ fontSize: '0.7rem' }}>#{li?.poLineItemNumber}</span>;
                                                })}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.78rem' }}>
                                            {nmr.lineItemIds?.slice(0, 2).map(id => {
                                                const li = poLineItems.find(l => l.id === id);
                                                return <div key={id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{li?.size} / {li?.wt}</div>;
                                            })}
                                            {nmr.lineItemIds?.length > 2 && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>+{nmr.lineItemIds.length - 2} more...</div>}
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            {(() => {
                                                const productMap = nmr.lineItemProducts || {};
                                                const productIds = (nmr.lineItemIds || [])
                                                    .map(id => productMap[id] || nmr.productId || '')
                                                    .filter(Boolean);
                                                if (productIds.length === 0) return '—';
                                                return (
                                                    <>
                                                        {productIds.slice(0, 2).map((pid, idx) => {
                                                            const p = products.find(prod => prod.id === pid);
                                                            return <div key={`${pid}-${idx}`} style={{ fontSize: '0.74rem' }}>{p ? p.code : '—'}</div>;
                                                        })}
                                                        {productIds.length > 2 && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>+{productIds.length - 2} more...</div>}
                                                    </>
                                                );
                                            })()}
                                        </td>

                                        <td onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                                {/* DRAFT → Submit */}
                                                {nmr.status === 'DRAFT' && (
                                                    <button className="btn-secondary"
                                                        style={{ padding: '0.28rem 0.55rem', fontSize: '0.74rem', color: '#f59e0b', borderColor: '#f59e0b' }}
                                                        onClick={() => setSubmitDialog({ id: nmr.id, submissionDate: new Date().toISOString().split('T')[0], isRev0: false })}>
                                                        <Send size={12} /> Submit
                                                    </button>
                                                )}
                                                {/* PENDING-REV0 → Submit Rev 0 */}
                                                {nmr.status === 'PENDING-REV0' && (
                                                    <button className="btn-secondary"
                                                        style={{ padding: '0.28rem 0.55rem', fontSize: '0.74rem', color: '#34d399', borderColor: '#34d399' }}
                                                        onClick={() => setSubmitDialog({ id: nmr.id, submissionDate: new Date().toISOString().split('T')[0], isRev0: true })}>
                                                        <Send size={12} /> Submit Rev 0
                                                    </button>
                                                )}
                                                {/* CODE-2 / CODE-3 → Reset to Draft */}
                                                {(nmr.status === 'CODE-2' || nmr.status === 'CODE-3') && (
                                                    <button className="btn-secondary"
                                                        style={{ padding: '0.28rem 0.55rem', fontSize: '0.74rem', color: '#60a5fa', borderColor: '#60a5fa' }}
                                                        onClick={() => resetNmrToDraft(nmr.id)}>
                                                        Rev {nmr.revision} Draft →
                                                    </button>
                                                )}
                                                {/* SUBMITTED → Record Client Response */}
                                                {nmr.status === 'SUBMITTED' && (
                                                    <button className="btn-secondary"
                                                        style={{ padding: '0.28rem 0.55rem', fontSize: '0.74rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}
                                                        onClick={() => setResponseDialog({ id: nmr.id, code: '1', returnDate: new Date().toISOString().split('T')[0], comment: '' })}>
                                                        Record Response
                                                    </button>
                                                )}
                                                {/* Edit (only when not locked) */}
                                                {!locked && (
                                                    <button className="icon-btn-small" onClick={() => handleEdit(nmr)} style={{ color: 'var(--text-secondary)' }}><Edit size={14} /></button>
                                                )}
                                                {locked && <Lock size={14} style={{ color: '#34d399', margin: '0 0.2rem' }} title="Locked" />}
                                                <button className="icon-btn-small" onClick={() => handleDelete(nmr.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* ── Expanded Detail ────────────────────────────────── */}
                                    {isExpanded && (
                                        <tr style={{ background: 'rgba(0,0,0,0.07)' }}>
                                            <td colSpan="10" style={{ padding: '1.5rem 2rem' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                                    {/* Line Items Detail */}
                                                    <div>
                                                        <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Line Items Details</h5>
                                                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                            <thead>
                                                                <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Item #</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Size / WT</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Description</th>
                                                                    <th style={{ textAlign: 'left', padding: '0.5rem' }}>Product</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {nmr.lineItemIds?.map(id => {
                                                                    const li = poLineItems.find(l => l.id === id);
                                                                    const productId = (nmr.lineItemProducts && nmr.lineItemProducts[id]) || nmr.productId;
                                                                    const p = products.find(prod => prod.id === productId);
                                                                    return (
                                                                        <tr key={id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                                            <td style={{ padding: '0.5rem' }}><span className="badge badge-info">#{li?.poLineItemNumber}</span></td>
                                                                            <td style={{ padding: '0.5rem' }}>{li?.size} / {li?.wt}</td>
                                                                            <td style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{li?.description}</td>
                                                                            <td style={{ padding: '0.5rem', fontSize: '0.75rem' }}>{p ? `${p.code} - ${p.name}` : '—'}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                        <div style={{ marginTop: '1.5rem' }}>
                                                            <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase' }}>Drawing &amp; Specification</h5>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.83rem' }}>
                                                                <div><span className="text-muted">Drawing No: </span><strong>{nmr.drawingNumber || '—'}</strong></div>
                                                                <div><span className="text-muted">Rev: </span><strong>{nmr.drawingRevision || '—'}</strong></div>
                                                                <div><span className="text-muted">Ref Drawing: </span><strong>{nmr.refDrawingNo || '—'}</strong></div>
                                                                <div style={{ gridColumn: 'span 2' }}><span className="text-muted">Title: </span><strong>{nmr.drawingTitle || '—'}</strong></div>
                                                                <div><span className="text-muted">Spec: </span><strong>{nmr.specification || '—'}</strong></div>
                                                                <div><span className="text-muted">Remarks: </span><strong>{nmr.remarks || '—'}</strong></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* Revision History */}
                                                    <div>
                                                        <h5 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <History size={14} /> Revision History (Submission &amp; Return Dates)
                                                        </h5>
                                                        {!nmr.revisionHistory?.length ? (
                                                            <p className="text-muted" style={{ fontSize: '0.82rem' }}>No submissions recorded yet.</p>
                                                        ) : (
                                                            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                                                <thead>
                                                                    <tr>
                                                                        {['Rev', 'Submission Date', 'Return Date', 'Code', 'Comment'].map(h => (
                                                                            <th key={h} style={{ textAlign: 'left', padding: '0.3rem 0.5rem', color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid var(--glass-border)', fontSize: '0.75rem' }}>{h}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {nmr.revisionHistory.map((r, i) => (
                                                                        <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                                            <td style={{ padding: '0.4rem 0.5rem', fontWeight: 800 }}>Rev {r.rev}</td>
                                                                            <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)' }}>
                                                                                {r.submissionDate ? <><Clock size={11} style={{ marginRight: 3 }} />{r.submissionDate}</> : '—'}
                                                                            </td>
                                                                            <td style={{ padding: '0.4rem 0.5rem', color: r.returnDate ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                                                                                {r.returnDate || '⏳ Pending'}
                                                                            </td>
                                                                            <td style={{ padding: '0.4rem 0.5rem' }}><CodeBadge code={r.code} /></td>
                                                                            <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.77rem' }}>{r.comment || '—'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                        {/* Status banner */}
                                                        {nmr.status === 'APPROVED' && (
                                                            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '8px', fontSize: '0.8rem', color: '#34d399', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <CheckCircle2 size={15} /> Rev 0 Code 1 approved — Production authorised to proceed.
                                                            </div>
                                                        )}
                                                        {nmr.status === 'PENDING-REV0' && (
                                                            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <AlertTriangle size={15} /> Code 1 received on alpha revision — formally submit Rev 0 to complete approval.
                                                            </div>
                                                        )}
                                                        {(nmr.status === 'CODE-3') && (
                                                            <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.9rem', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', fontSize: '0.8rem', color: '#f87171', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                <XCircle size={15} /> Code 3 — Work may NOT proceed. Revise and resubmit.
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {filteredNmrs.length === 0 && (
                            <tr><td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                <FileText size={36} style={{ margin: '0 auto 0.75rem', display: 'block', opacity: 0.3 }} />
                                No NMR documents found. Create one to begin.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Submit Dialog ─────────────────────────────────────────── */}
            {submitDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel animate-fade-in" style={{ width: 400, borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h4><Send size={16} style={{ marginRight: 6 }} />{submitDialog.isRev0 ? 'Submit Formal Rev 0' : 'Submit for Client Review'}</h4>
                            <button onClick={() => setSubmitDialog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                        </div>
                        {submitDialog.isRev0 && (
                            <p style={{ fontSize: '0.83rem', color: '#f59e0b', marginBottom: '0.8rem' }}>
                                Code 1 was received on the alpha revision. Submit Rev 0 for formal client approval.
                            </p>
                        )}
                        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                            <label className="input-label">Submission Date</label>
                            <input type="date" className="premium-input" value={submitDialog.submissionDate}
                                onChange={e => setSubmitDialog({ ...submitDialog, submissionDate: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setSubmitDialog(null)}>Cancel</button>
                            <button className="btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => {
                                if (submitDialog.isRev0) submitNmrRev0(submitDialog.id, submitDialog.submissionDate);
                                else submitNmrForReview(submitDialog.id, submitDialog.submissionDate);
                                setSubmitDialog(null);
                            }}>
                                <Send size={15} /> Confirm Submission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Client Response Dialog ────────────────────────────────── */}
            {responseDialog && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="glass-panel animate-fade-in" style={{ width: 480, borderLeft: '4px solid var(--accent-primary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h4>Record Client Response</h4>
                            <button onClick={() => setResponseDialog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
                        </div>
                        {/* Code selector */}
                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label className="input-label">Client Response Code</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
                                {Object.entries(CLIENT_CODES).map(([key, cfg]) => (
                                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem 0.75rem', borderRadius: '8px', background: responseDialog.code === key ? cfg.bg : 'transparent', border: `1px solid ${responseDialog.code === key ? cfg.color + '55' : 'transparent'}`, transition: 'all .15s' }}>
                                        <input type="radio" name="nmrCode" value={key} checked={responseDialog.code === key} onChange={() => setResponseDialog({ ...responseDialog, code: key })} style={{ accentColor: cfg.color }} />
                                        <CodeBadge code={key} />
                                        <span style={{ fontSize: '0.83rem', color: responseDialog.code === key ? cfg.color : 'var(--text-secondary)', fontWeight: responseDialog.code === key ? 600 : 400 }}>{cfg.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="form-grid" style={{ marginBottom: '1rem' }}>
                            <div className="input-group">
                                <label className="input-label">Return Date</label>
                                <input type="date" className="premium-input" value={responseDialog.returnDate}
                                    onChange={e => setResponseDialog({ ...responseDialog, returnDate: e.target.value })} />
                            </div>
                        </div>
                        <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                            <label className="input-label">Comment / Remarks</label>
                            <textarea className="premium-input" rows={2} value={responseDialog.comment}
                                onChange={e => setResponseDialog({ ...responseDialog, comment: e.target.value })}
                                placeholder="Enter client remarks if any..." />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setResponseDialog(null)}>Cancel</button>
                            <button className="btn-primary" onClick={() => {
                                recordNmrClientResponse(responseDialog.id, { code: responseDialog.code, returnDate: responseDialog.returnDate, comment: responseDialog.comment });
                                setResponseDialog(null);
                            }}>
                                <CheckCircle2 size={15} /> Record Response
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NMRPage;
