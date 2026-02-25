import React, { useState } from 'react';
import { Play, Square, CheckSquare, SkipForward, User, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import './QualityPage.css';

// Master JIS Routing Library based on Product Category
const JIS_TEMPLATES = {
    'Cladded Pipe': [
        { op: 'OP 10', desc: 'CUT TO LENGTH' },
        { op: 'OP 20', desc: 'PRE-MACHINING (if required)' },
        { op: 'OP 30', desc: 'INTERNAL BLASTING' },
        { op: 'OP 40', desc: 'THICKNESS SURVEY – BEFORE WELDOVERLAY' },
        { op: 'OP 50', desc: 'WELDOVERLAY (CLADDING)' },
        { op: 'OP 120', desc: 'LPT & VT, PMI' },
        { op: 'OP 130', desc: 'RT' },
        { op: 'OP 140', desc: 'UT' },
        { op: 'OP 150', desc: 'BEVELING' },
        { op: 'OP 230', desc: 'FINAL DIMENSION' },
        { op: 'OP 240', desc: 'HYDROTEST / SURFACE TREATMENT' },
        { op: 'OP 270', desc: 'MARKING & PACKING' },
        { op: 'OP 280', desc: 'PRE-DELIVERY INSPECTION' }
    ],
    'Flange': [
        { op: 'OP 20', desc: 'PRE-MACHINING (if required)' },
        { op: 'OP 30', desc: 'INTERNAL BLASTING' },
        { op: 'OP 40', desc: 'THICKNESS SURVEY' },
        { op: 'OP 50', desc: 'WELDOVERLAY (CLADDING)' },
        { op: 'OP 80', desc: 'FINAL MACHINING' },
        { op: 'OP 120', desc: 'LPT & VT, PMI' },
        { op: 'OP 230', desc: 'FINAL DIMENSION' },
        { op: 'OP 270', desc: 'MARKING & PACKING' }
    ],
    // Fallback for simplicity
    'Default': [
        { op: 'OP 10', desc: 'RECEIVING INSPECTION' },
        { op: 'OP 50', desc: 'WELDOVERLAY (CLADDING)' },
        { op: 'OP 120', desc: 'LPT & VT, PMI' },
        { op: 'OP 230', desc: 'FINAL DIMENSION' }
    ]
};

const QualityPage = () => {
    const { spools, jisOperations, addJisOperation, updateJisOperation, deleteJisOperation } = useStore();
    const [selectedItem, setSelectedItem] = useState(null);
    const [inspectorId, setInspectorId] = useState('');

    // Custom Operation State
    const [showOpForm, setShowOpForm] = useState(false);
    const [editingOp, setEditingOp] = useState(null);
    const initialOpState = { processName: '', description: '', sequence: '' };
    const [opFormData, setOpFormData] = useState(initialOpState);

    // Finding items that have started or finished Cladding (have a Sage Code)
    const availableItems = spools.filter(s => s.sageCode);

    // Initialize operations for an item if they don't exist
    const handleSelectItem = (item) => {
        setSelectedItem(item);
        cancelOpEdit();

        // Check if operations are already generated for this item
        const existingOps = jisOperations.filter(j => j.targetId === item.id);
        if (existingOps.length === 0) {
            // Generate from template
            const template = JIS_TEMPLATES[item.itemCategory] || JIS_TEMPLATES['Default'];
            const newOps = template.map((step, idx) => ({
                targetId: item.id,
                category: 'CLADDING/SPOOL',
                processName: step.op,
                description: step.desc,
                sequence: idx + 1,
                status: 'Pending', // Pending, Active, Completed, Skipped
                startDate: null,
                finishDate: null,
                inspectorId: ''
            }));
            // Due to array creation, manually adding each to store
            newOps.forEach(op => addJisOperation(op));
        }
    };

    const handleAction = (op, actionType) => {
        if (!inspectorId) return alert('Please enter an Inspector ID before signing off.');

        const timestamp = new Date().toISOString();
        if (actionType === 'START') {
            updateJisOperation(op.id, { status: 'Active', startDate: timestamp, inspectorId });
        } else if (actionType === 'FINISH') {
            updateJisOperation(op.id, { status: 'Completed', finishDate: timestamp, inspectorId });
        } else if (actionType === 'SKIP') {
            updateJisOperation(op.id, { status: 'Skipped', finishDate: timestamp, inspectorId });
        }
    };

    const handleDeleteOp = (id) => {
        if (window.confirm("Are you sure you want to delete this operation?")) {
            deleteJisOperation(id);
        }
    };

    const openOpEdit = (op) => {
        if (op) {
            setEditingOp(op);
            setOpFormData({ processName: op.processName, description: op.description, sequence: op.sequence });
        } else {
            setEditingOp(null);
            const nextSeq = Math.max(...currentOps.map(o => o.sequence), 0) + 1;
            setOpFormData({ ...initialOpState, sequence: nextSeq });
        }
        setShowOpForm(true);
    };

    const cancelOpEdit = () => {
        setShowOpForm(false);
        setEditingOp(null);
        setOpFormData(initialOpState);
    };

    const handleSaveOp = (e) => {
        e.preventDefault();
        if (editingOp) {
            updateJisOperation(editingOp.id, { ...opFormData, sequence: Number(opFormData.sequence) });
        } else {
            addJisOperation({
                targetId: selectedItem.id,
                category: 'CLADDING/SPOOL',
                processName: opFormData.processName,
                description: opFormData.description,
                sequence: Number(opFormData.sequence),
                status: 'Pending',
                startDate: null,
                finishDate: null,
                inspectorId: ''
            });
        }
        cancelOpEdit();
    };

    // Get current selected item operations
    const currentOps = jisOperations.filter(j => j.targetId === selectedItem?.id).sort((a, b) => a.sequence - b.sequence);

    return (
        <div className="page-container animate-fade-in pb-10">
            <div className="page-header">
                <div>
                    <h2>Job Instruction Sheets (JIS)</h2>
                    <p className="subtitle">Mobile-friendly operator view for routing engine and process sign-offs.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Enter Inspector ID"
                        className="premium-input"
                        style={{ width: '200px', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                        value={inspectorId}
                        onChange={(e) => setInspectorId(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-layout">
                <div className="items-sidebar glass-panel">
                    <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Select Item</h4>
                    <div className="item-list">
                        {availableItems.map(item => (
                            <div
                                key={item.id}
                                className={`item-select-card ${selectedItem?.id === item.id ? 'active' : ''}`}
                                onClick={() => handleSelectItem(item)}
                            >
                                <strong>{item.sageCode}</strong>
                                <p>{item.itemCategory}</p>
                                <small>{item.barcode}</small>
                            </div>
                        ))}
                        {availableItems.length === 0 && <p className="text-muted">No items available. Complete Cladding operations first.</p>}
                    </div>
                </div>

                <div className="jis-main glass-panel">
                    {!selectedItem ? (
                        <div className="empty-state">
                            <CheckSquare size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
                            <p>Select an item from the left to view its Job Instruction Sheet routing.</p>
                        </div>
                    ) : (
                        <div>
                            <div className="jis-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3>JIS Routing: {selectedItem.itemCategory}</h3>
                                    <p>Tracking SAGE CODE: <strong style={{ color: 'var(--accent-primary)' }}>{selectedItem.sageCode}</strong></p>
                                    <p className="text-muted" style={{ fontSize: '0.8rem' }}>Barcode: {selectedItem.barcode}</p>
                                </div>
                                {!showOpForm && (
                                    <button className="btn-secondary" onClick={() => openOpEdit(null)}>
                                        <Plus size={16} /> Add Operation
                                    </button>
                                )}
                            </div>

                            {showOpForm && (
                                <div className="glass-panel create-form-panel animate-fade-in" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                                    <div className="form-header">
                                        <h4>{editingOp ? `Edit Operation: ${editingOp.processName}` : 'Add Custom Operation'}</h4>
                                        <button className="icon-btn-small" onClick={cancelOpEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleSaveOp} className="so-form">
                                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                            <div className="input-group">
                                                <label className="input-label">Operation / Step Name</label>
                                                <input
                                                    type="text" className="premium-input" placeholder="e.g. OP 60"
                                                    value={opFormData.processName} onChange={(e) => setOpFormData({ ...opFormData, processName: e.target.value })} required
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">Sequence #</label>
                                                <input
                                                    type="number" className="premium-input"
                                                    value={opFormData.sequence} onChange={(e) => setOpFormData({ ...opFormData, sequence: e.target.value })} required min="1"
                                                />
                                            </div>
                                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                                <label className="input-label">Description</label>
                                                <input
                                                    type="text" className="premium-input"
                                                    value={opFormData.description} onChange={(e) => setOpFormData({ ...opFormData, description: e.target.value })} required
                                                />
                                            </div>
                                        </div>
                                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                            <button type="button" className="btn-secondary" onClick={cancelOpEdit}>Cancel</button>
                                            <button type="submit" className="btn-primary"><Save size={18} /> {editingOp ? 'Update Operation' : 'Add Operation'}</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="routing-timeline">
                                {currentOps.map((op, index) => {
                                    const isPreviousCompletedOrSkipped = index === 0 || ['Completed', 'Skipped'].includes(currentOps[index - 1].status);
                                    const isLocked = !isPreviousCompletedOrSkipped && op.status === 'Pending';
                                    const canEdit = op.status === 'Pending';

                                    return (
                                        <div key={op.id} className={`routing-step ${op.status.toLowerCase()} ${isLocked ? 'locked' : ''}`}>
                                            <div className="step-indicator">
                                                <div className="circle"></div>
                                                {index < currentOps.length - 1 && <div className="line"></div>}
                                            </div>

                                            <div className="step-content">
                                                <div className="step-details">
                                                    <span className="op-number">{op.processName}</span>
                                                    <h4>{op.description}</h4>
                                                    {(op.startDate || op.finishDate) && (
                                                        <div className="step-meta">
                                                            {op.startDate && <span>Start: {new Date(op.startDate).toLocaleTimeString()}</span>}
                                                            {op.finishDate && <span>Finish: {new Date(op.finishDate).toLocaleTimeString()}</span>}
                                                            {op.inspectorId && <span>Inspector: <strong>{op.inspectorId}</strong></span>}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="step-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {canEdit && (
                                                        <>
                                                            <button className="icon-btn-small" title="Edit Operation" onClick={() => openOpEdit(op)} style={{ color: 'var(--text-secondary)' }}>
                                                                <Edit size={16} />
                                                            </button>
                                                            <button className="icon-btn-small" title="Delete Operation" onClick={() => handleDeleteOp(op.id)} style={{ color: 'var(--danger)' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <div style={{ width: '1px', height: '20px', background: 'var(--glass-border)', margin: '0 8px' }}></div>
                                                        </>
                                                    )}

                                                    {op.status === 'Pending' && !isLocked && (
                                                        <>
                                                            <button className="icon-btn-small" title="Skip Operation" onClick={() => handleAction(op, 'SKIP')}>
                                                                <SkipForward size={16} />
                                                            </button>
                                                            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAction(op, 'START')}>
                                                                <Play size={14} /> Start
                                                            </button>
                                                        </>
                                                    )}
                                                    {op.status === 'Active' && (
                                                        <button className="btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleAction(op, 'FINISH')}>
                                                            <Square size={14} /> Finish
                                                        </button>
                                                    )}
                                                    {op.status === 'Completed' && <span className="badge badge-success">Completed</span>}
                                                    {op.status === 'Skipped' && <span className="badge" style={{ color: 'var(--text-muted)' }}>Skipped</span>}
                                                    {isLocked && <span className="text-muted" style={{ fontSize: '0.8rem' }}>Waiting on prev step</span>}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                                {currentOps.length === 0 && !showOpForm && (
                                    <div className="text-center text-muted" style={{ padding: '2rem' }}>No routing operations defined. Please add one.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QualityPage;
