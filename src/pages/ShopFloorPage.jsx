import React, { useState } from 'react';
import Barcode from 'react-barcode';
import { Play, CheckCircle2, QrCode, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import './ShopFloorPage.css';

const ShopFloorPage = () => {
    const { spools, generateSageCodeForSpool, updateSpool, deleteSpool } = useStore();
    const [activeBarcode, setActiveBarcode] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit State
    const [editingSpool, setEditingSpool] = useState(null);
    const [formData, setFormData] = useState({ description: '', qtyLength: '' });

    // Filter all spools based on search query
    const filteredSpools = spools.filter(s =>
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.poId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.sageCode && s.sageCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.itemCategory.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Separate spools by status to show the Cladding flow
    const pendingCladding = filteredSpools.filter(s => s.status === 'Pending Cladding');
    const claddedItems = filteredSpools.filter(s => s.status !== 'Pending Cladding');

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this Spool? This cannot be undone.")) {
            deleteSpool(id);
        }
    };

    const openEdit = (spool) => {
        setEditingSpool(spool);
        setFormData({
            description: spool.description || '',
            qtyLength: spool.qtyLength || ''
        });
    };

    const cancelEdit = () => {
        setEditingSpool(null);
        setFormData({ description: '', qtyLength: '' });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        if (editingSpool) {
            updateSpool(editingSpool.id, formData);
        }
        cancelEdit();
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>Cladding Operations (Phase 1)</h2>
                    <p className="subtitle">Execute cladding on loose individual items to generate internal SAGE CODES for Assembly.</p>
                </div>
                <div className="md-search" style={{ position: 'relative', width: '300px' }}>
                    <Search className="search-icon" size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        className="premium-input"
                        style={{ paddingLeft: '2.25rem' }}
                        placeholder="Search IDs, SAGE Codes, POs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Global Edit Modal for Spools */}
            {editingSpool && (
                <div className="glass-panel create-form-panel animate-fade-in" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="form-header">
                        <h3>Edit Spool: {editingSpool.id}</h3>
                        <button className="icon-btn-small" onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleUpdate} className="so-form">
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div className="input-group">
                                <label className="input-label">Description</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Qty / Length</label>
                                <input
                                    type="number" className="premium-input"
                                    value={formData.qtyLength} onChange={(e) => setFormData({ ...formData, qtyLength: Number(e.target.value) })} required
                                />
                            </div>
                        </div>
                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                            <button type="submit" className="btn-primary"><Save size={18} /> Update Spool Details</button>
                        </div>
                    </form>
                </div>
            )}

            <h3 style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Pending Cladding ({pendingCladding.length})</h3>
            <div className="shop-floor-grid">
                {pendingCladding.map(spool => (
                    <div key={spool.id} className="glass-panel op-card">
                        <div className="op-header">
                            <span className="op-id badge badge-info">{spool.id}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="icon-btn-small" onClick={() => setActiveBarcode(activeBarcode === spool.barcode ? null : spool.barcode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <QrCode size={18} />
                                </button>
                                <button className="icon-btn-small" onClick={() => openEdit(spool)} title="Edit Spool" style={{ color: 'var(--text-secondary)' }}>
                                    <Edit size={16} />
                                </button>
                                <button className="icon-btn-small" onClick={() => handleDelete(spool.id)} title="Delete Spool" style={{ color: 'var(--danger)' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        {activeBarcode === spool.barcode && (
                            <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', display: 'flex', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                                <Barcode value={spool.barcode} height={40} fontSize={12} width={1.5} margin={0} />
                            </div>
                        )}

                        <h3 className="op-component">{spool.itemCategory}</h3>
                        <p className="op-process" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {spool.description || 'No Description'}
                        </p>

                        <div className="op-details" style={{ marginBottom: '1rem' }}>
                            <span>PO ID: <strong style={{ color: 'var(--text-primary)' }}>{spool.poId}</strong></span>
                            <span>Qty/Length: {spool.qtyLength}</span>
                        </div>

                        <div className="op-actions">
                            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => generateSageCodeForSpool(spool.id)}>
                                <Play size={16} /> Complete Cladding
                            </button>
                        </div>
                    </div>
                ))}
                {pendingCladding.length === 0 && (
                    <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                        <p className="text-muted">No pending items found.</p>
                    </div>
                )}
            </div>

            <h3 style={{ marginTop: '2rem', color: 'var(--success)' }}>Cladded Items (Ready for Assembly) ({claddedItems.length})</h3>
            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Item ID</th>
                            <th>Barcode</th>
                            <th>Category</th>
                            <th>Tracking SAGE CODE</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claddedItems.map(item => (
                            <tr key={item.id}>
                                <td className="highlight-text">{item.id}</td>
                                <td style={{ background: 'white', padding: '0.2rem' }}>
                                    <Barcode value={item.barcode} height={20} fontSize={10} width={1} displayValue={false} margin={0} />
                                </td>
                                <td>{item.itemCategory}</td>
                                <td>
                                    <div className="badge badge-info">
                                        {item.sageCode}
                                    </div>
                                </td>
                                <td><span className="badge badge-success"><CheckCircle2 size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {item.status}</span></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button className="icon-btn-small" onClick={() => openEdit(item)} title="Edit Spool" style={{ color: 'var(--text-secondary)' }}>
                                            <Edit size={16} />
                                        </button>
                                        <button className="icon-btn-small" onClick={() => handleDelete(item.id)} title="Delete Spool" style={{ color: 'var(--danger)' }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {claddedItems.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">No cladded items found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ShopFloorPage;
