import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Trash2, Save, ArrowUpRight, Edit, X, ChevronUp, ChevronDown } from 'lucide-react';
import './SalesOrdersPage.css'; // reuse form and table utility styles for responsiveness

const MTOPage = () => {
    const {
        mtos,
        addMTO,
        updateMTO,
        deleteMTO,
        projects,
        purchaseOrders,
        nmrDocuments,
        poLineItems
    } = useStore();

    const [showCreate, setShowCreate] = React.useState(false);
    const [editingMto, setEditingMto] = React.useState(null);
    const [errors, setErrors] = React.useState({});
    const [expandedMto, setExpandedMto] = React.useState(null);

    // form state
    const [number, setNumber] = React.useState('');
    const [projectId, setProjectId] = React.useState('');
    const [poId, setPoId] = React.useState('');
    const [nmrId, setNmrId] = React.useState('');
    const [lineItemMaterials, setLineItemMaterials] = React.useState({});

    const currentPOs = useMemo(() => (
        purchaseOrders.filter(po => po.projectId === projectId)
    ), [purchaseOrders, projectId]);

    const currentNMRs = useMemo(() => (
        nmrDocuments.filter(n => n.projectId === projectId)
    ), [nmrDocuments, projectId]);

    const availableNMRs = useMemo(() => {
        if (!projectId) return [];
        return nmrDocuments.filter(n => n.projectId === projectId && (!poId || n.poId === poId));
    }, [nmrDocuments, projectId, poId]);

    const resetForm = () => {
        setNumber('');
        setProjectId('');
        setPoId('');
        setNmrId('');
        setLineItemMaterials({});
        setEditingMto(null);
        setShowCreate(false);
    };

    const beginEdit = (m) => {
        setEditingMto(m);
        setNumber(m.number || '');
        setProjectId(m.projectId || '');
        setPoId(m.purchaseOrderId || '');
        setNmrId(m.nmrDocumentId || '');
        setLineItemMaterials(m.lineItemMaterials || {});
        setShowCreate(true);
    };

    const handleSave = () => {
        const newErrors = {};
        if (!number.trim()) newErrors.number = 'Number is required';
        if (!projectId) newErrors.projectId = 'Please select a project';
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const payload = {
            number: number.trim(),
            projectId,
            purchaseOrderId: poId || null,
            nmrDocumentId: nmrId || null,
            lineItemMaterials
        };
        if (editingMto) {
            updateMTO(editingMto.id, payload);
        } else {
            addMTO({ id: `MTO-${Math.random().toString(36).substr(2, 9)}`, ...payload });
        }
        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this MTO?')) {
            deleteMTO(id);
            if (editingMto && editingMto.id === id) resetForm();
        }
    };

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <div>
                    <h2>Material Take-Offs</h2>
                    <p className="subtitle">Record material take-off information and link to POs/NMRs</p>
                </div>
                {!showCreate && (
                    <button className="btn-primary" onClick={() => setShowCreate(true)}>
                        <Plus size={18} /> New MTO
                    </button>
                )}
            </header>

            {/* list of existing MTOs */}
            {!showCreate && (
                <div className="glass-panel table-container" style={{ marginBottom: '2rem' }}>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Number</th>
                            <th>Project</th>
                            <th>PO</th>
                            <th>NMR</th>
                            <th>Mat’ls</th>
                            <th />
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {mtos.map(m => (
                            <tr key={m.id}>
                                <td>{m.number}</td>
                                <td>{projects.find(p => p.id === m.projectId)?.id || ''}</td>
                                <td>{purchaseOrders.find(po => po.id === m.purchaseOrderId)?.poNumber || ''}</td>
                                <td>{nmrDocuments.find(n => n.id === m.nmrDocumentId)?.drawingNumber || ''}</td>
                                <td style={{ textAlign: 'center' }}>{m.lineItemMaterials ? Object.keys(m.lineItemMaterials).filter(k => m.lineItemMaterials[k]).length : 0}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="icon-btn" onClick={() => beginEdit(m)}><Edit size={16} /></button>
                                    <button className="icon-btn text-danger" onClick={() => handleDelete(m.id)}><Trash2 size={16} /></button>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                    <button className="icon-btn" onClick={() => setExpandedMto(expandedMto === m.id ? null : m.id)}>
                                        {expandedMto === m.id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {mtos.length === 0 && (
                            <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>no records</td></tr>
                        )}
                    </tbody>
                </table>
                {expandedMto && (
                    (() => {
                        const m = mtos.find(item => item.id === expandedMto);
                        if (!m) return null;
                        const projPOs = purchaseOrders.filter(po => po.projectId === m.projectId);
                        const projNMRs = nmrDocuments.filter(n => n.projectId === m.projectId && (!m.purchaseOrderId || n.poId === m.purchaseOrderId));
                        const lineItems = poLineItems.filter(li => li.poId === m.purchaseOrderId);
                        return (
                            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid var(--glass-border)' }}>
                                <div><strong>Project</strong>: {m.projectId}</div>
                                <div><strong>Related POs</strong>: {projPOs.map(po => po.poNumber || po.id).join(', ')}</div>
                                <div><strong>Related NMRs</strong>: {projNMRs.map(n => n.drawingNumber).join(', ')}</div>
                                {lineItems.length > 0 && (
                                    <table className="data-table" style={{ marginTop: '1rem' }}>
                                        <thead><tr><th>Line Item</th><th>Category</th><th>Materials</th></tr></thead>
                                        <tbody>
                                            {lineItems.map(li => (
                                                <tr key={li.id}>
                                                    <td>{li.poLineItemNumber || li.id}</td>
                                                    <td>{li.itemCategory}</td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="premium-input"
                                                            value={m.lineItemMaterials?.[li.id] || ''}
                                                            onChange={e => {
                                                                const mat = { ...(m.lineItemMaterials || {}), [li.id]: e.target.value };
                                                                updateMTO(m.id, { lineItemMaterials: mat });
                                                            }}
                                                            placeholder="required materials"
                                                            style={{ width: '100%' }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        );
                    })()
                )}
                </div>
            )}

            {/* form */}
            {showCreate && (
                <div className="glass-panel create-form-panel animate-fade-in" style={{ borderLeft: '4px solid var(--accent-primary)', marginBottom: '2rem' }}>
                    <div className="form-header">
                        <h3>{editingMto ? `Edit MTO: ${editingMto.number}` : 'Create New MTO'}</h3>
                        <button className="icon-btn-small" onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label" title="Unique identifier, e.g. MTO-001">Number</label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    value={number}
                                    onChange={e => { setNumber(e.target.value); if (errors.number) setErrors(prev => ({ ...prev, number: null })); }}
                                    placeholder="e.g. MTO-001"
                                    title="e.g. MTO-001"
                                />
                                {errors.number && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.number}</div>}
                            </div>

                            <div className="input-group">
                                <label className="input-label" title="Associate the MTO with a project">Project</label>
                                <select
                                    className="premium-input select-input"
                                    value={projectId}
                                    onChange={e => { setProjectId(e.target.value); if (errors.projectId) setErrors(prev => ({ ...prev, projectId: null })); }}
                                >
                                    <option value="">-- choose --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.id} {p.name ? `– ${p.name}` : ''}</option>
                                    ))}
                                </select>
                                {errors.projectId && <div style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.projectId}</div>}
                            </div>

                            <div className="input-group">
                                <label className="input-label" title="Optionally link a related PO">Purchase Order (optional)</label>
                                <select
                                    className="premium-input select-input"
                                    value={poId || ''}
                                    onChange={e => setPoId(e.target.value)}
                                    disabled={!projectId}
                                >
                                    <option value="">-- none --</option>
                                    {currentPOs.map(po => (
                                        <option key={po.id} value={po.id}>{po.poNumber || po.id}</option>
                                    ))}
                                </select>
                                {projectId && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentPOs.length} POs available for project</div>}
                            </div>

                            <div className="input-group">
                                <label className="input-label" title="Optionally link a related NMR document">NMR Document (optional)</label>
                                <select
                                    className="premium-input select-input"
                                    value={nmrId || ''}
                                    onChange={e => setNmrId(e.target.value)}
                                    disabled={!projectId}
                                >
                                    <option value="">-- none --</option>
                                    {currentNMRs.map(n => (
                                        <option key={n.id} value={n.id}>{n.drawingNumber}</option>
                                    ))}
                                </select>
                                {projectId && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{availableNMRs.length} NMRs matching project{poId ? ' + PO' : ''}</div>}
                            </div>
                        </div>

                        {poId && (
                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>PO Line Items / Materials</h4>
                                <table className="data-table">
                                    <thead><tr><th>Item #</th><th>Category</th><th>Materials Needed</th></tr></thead>
                                    <tbody>
                                        {poLineItems.filter(li => li.poId === poId).map(li => (
                                            <tr key={li.id}>
                                                <td>{li.poLineItemNumber || li.id}</td>
                                                <td>{li.itemCategory}</td>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="premium-input"
                                                        value={lineItemMaterials[li.id] || ''}
                                                        onChange={e => setLineItemMaterials(prev => ({ ...prev, [li.id]: e.target.value }))}
                                                        placeholder="materials required"
                                                        style={{ width: '100%' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        {poLineItems.filter(li => li.poId === poId).length === 0 && (
                                            <tr><td colSpan={3} className="text-center text-muted py-2">No line items for selected PO.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={!number.trim() || !projectId}>
                                <Save size={16} /> Save
                            </button>
                            {editingMto && (
                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(editingMto.id)}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            )}
                            <button type="button" className="btn btn-link" onClick={resetForm}>
                                <ArrowUpRight size={16} /> Back to list
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MTOPage;