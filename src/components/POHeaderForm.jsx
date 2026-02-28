import React, { useState } from 'react';
import { Plus, X, ChevronRight, Edit, Trash2, Save, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import POLineItemsForm from './POLineItemsForm';

const DEFAULT_BANKS = [
    'Saudi National Bank (SNB)',
    'Al Rajhi Bank',
    'Riyad Bank',
    'Saudi British Bank (SABB)',
    'Arab National Bank (ANB)',
    'Bank Al Bilad',
    'Bank AlJazira',
    'Capital Bank',
    'Alkobiar Bank',
    'Gulf International Bank (GIB)',
    'Arab Banking Corporation',
    'Small Business Bank',
];

// ── Bank Input Component (reusable) ────────────────────────────────────────────
const BankInput = ({ banks = [], onChange, availableBanks = DEFAULT_BANKS }) => {
    const [inputVal, setInputVal] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSelect = (bank) => {
        if (bank && !banks.includes(bank)) {
            onChange([...banks, bank]);
        }
        setInputVal('');
        setIsDropdownOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputVal.trim()) {
            e.preventDefault();
            const newBank = inputVal.trim();
            if (newBank && !banks.includes(newBank)) {
                onChange([...banks, newBank]);
            }
            setInputVal('');
            setIsDropdownOpen(false);
        } else if (e.key === 'Backspace' && !inputVal && banks.length > 0) {
            onChange(banks.slice(0, -1));
        }
    };

    const filteredBanks = availableBanks.filter(b => 
        !banks.includes(b) && b.toLowerCase().includes(inputVal.toLowerCase())
    );

    return (
        <div style={{ position: 'relative' }}>
            <div
                className="premium-input"
                style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '2.6rem', padding: '0.4rem 0.75rem', cursor: 'text', height: 'auto' }}
                onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
            >
                {banks.map((bank, i) => (
                    <span key={i} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: 'rgba(59, 130, 246, 0.18)', color: '#3b82f6',
                        borderRadius: '999px', padding: '0.15rem 0.7rem',
                        fontSize: '0.82rem', fontWeight: 500, border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}>
                        {bank}
                        <span onClick={(e) => { e.stopPropagation(); onChange(banks.filter((_, j) => j !== i)); }}
                            style={{ cursor: 'pointer', lineHeight: 1, marginLeft: '0.1rem', opacity: 0.7 }}>×</span>
                    </span>
                ))}
                <input
                    type="text" value={inputVal}
                    onChange={(e) => { setInputVal(e.target.value); setIsDropdownOpen(true); }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    placeholder={banks.length === 0 ? 'Search or add banks...' : ''}
                    style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', flex: '1 0 150px', minWidth: '100px', fontSize: '0.9rem', padding: '0.1rem 0' }}
                />
            </div>
            {isDropdownOpen && filteredBanks.length > 0 && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    borderRadius: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 1000, maxHeight: '200px', overflowY: 'auto'
                }}>
                    {filteredBanks.map((bank, i) => (
                        <div key={i}
                            onClick={() => handleSelect(bank)}
                            style={{
                                padding: '0.6rem 0.75rem', cursor: 'pointer',
                                borderBottom: i < filteredBanks.length - 1 ? '1px solid var(--glass-border)' : 'none',
                                fontSize: '0.9rem', color: 'var(--text-primary)',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {bank}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

// ── Tag Input Component (reusable) ────────────────────────────────────────────
const TagInput = ({ tags = [], onChange, placeholder = 'Type and press Enter...' }) => {
    const [inputVal, setInputVal] = useState('');

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
            e.preventDefault();
            const newTag = inputVal.trim().replace(/,$/, '');
            if (newTag && !tags.includes(newTag)) onChange([...tags, newTag]);
            setInputVal('');
        } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    return (
        <div
            className="premium-input"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '2.6rem', padding: '0.4rem 0.75rem', cursor: 'text', height: 'auto' }}
            onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
        >
            {tags.map((tag, i) => (
                <span key={i} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    background: 'rgba(99,102,241,0.18)', color: 'var(--accent-primary)',
                    borderRadius: '999px', padding: '0.15rem 0.7rem',
                    fontSize: '0.82rem', fontWeight: 500, border: '1px solid rgba(99,102,241,0.3)',
                }}>
                    <Tag size={11} />{tag}
                    <span onClick={(e) => { e.stopPropagation(); onChange(tags.filter((_, j) => j !== i)); }}
                        style={{ cursor: 'pointer', lineHeight: 1, marginLeft: '0.1rem', opacity: 0.7 }}>×</span>
                </span>
            ))}
            <input
                type="text" value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? placeholder : ''}
                style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', flex: '1 0 120px', minWidth: '80px', fontSize: '0.9rem', padding: '0.1rem 0' }}
            />
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

const POHeaderForm = ({ projectId }) => {
    const {
        purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
        projects, customers, nmrDocuments
    } = useStore();
    const [showCreate, setShowCreate] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [editingPO, setEditingPO] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);

    // Derive the customer's Division from master data
    const project = projects.find(p => p.id === projectId);
    const customer = customers.find(c => c.name === project?.customer);
    const customerDivision = customer?.division || 'DIRECT';

    const initialFormState = {
        poNumber: '',
        poDate: new Date().toISOString().split('T')[0],
        poRev: '0',
        poTags: [],
        bankAssignments: [],
        contacts: [{ name: '', email: '', phone: '' }]
    };

    const [formData, setFormData] = useState(initialFormState);

    const projectPOs = purchaseOrders.filter(po => po.projectId === projectId);

    const handleAddContact = () => {
        setFormData({ ...formData, contacts: [...formData.contacts, { name: '', email: '', phone: '' }] });
    };

    const handleContactChange = (index, field, value) => {
        const newContacts = [...formData.contacts];
        newContacts[index][field] = value;
        setFormData({ ...formData, contacts: newContacts });
    };

    const handleRemoveContact = (index) => {
        setFormData({ ...formData, contacts: formData.contacts.filter((_, i) => i !== index) });
    };

    const handleCreateOrUpdate = (e) => {
        e.preventDefault();
        if (editingPO) {
            updatePurchaseOrder(editingPO.id, formData);
        } else {
            addPurchaseOrder({ ...formData, projectId });
        }
        setShowCreate(false);
        setEditingPO(null);
        setFormData(initialFormState);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this Purchase Order? This will remove all associated line items.")) {
            deletePurchaseOrder(id);
        }
    };

    const openEdit = (po) => {
        setEditingPO(po);
        setFormData({
            poNumber: po.poNumber,
            poDate: po.poDate,
            poRev: po.poRev,
            poTags: po.poTags || [],
            bankAssignments: po.bankAssignments || [],
            contacts: JSON.parse(JSON.stringify(po.contacts))
        });
        setShowCreate(true);
    };

    const cancelEdit = () => {
        setShowCreate(false);
        setEditingPO(null);
        setFormData(initialFormState);
    };

    if (selectedPO) {
        return (
            <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
                <div className="breadcrumb" style={{ marginBottom: '1rem' }}>
                    <span className="text-muted cursor-pointer hover-underline" onClick={() => setSelectedPO(null)}>Purchase Orders</span>
                    <ChevronRight size={16} className="text-muted mx-2" />
                    <span className="highlight-text">{selectedPO.poNumber} (Rev {selectedPO.poRev})</span>
                </div>
                <POLineItemsForm poId={selectedPO.id} projectId={projectId} />
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ marginTop: '2rem' }}>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h3>Project Purchase Orders</h3>
                {!showCreate && (
                    <button className="btn-primary" onClick={() => setShowCreate(true)}>
                        <Plus size={18} /> Add PO
                    </button>
                )}
            </div>

            {!showCreate ? (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Internal ID</th>
                                <th>Customer PO</th>
                                <th>Date</th>
                                <th>Rev</th>
                                <th>Division</th>
                                <th>NMRs</th>
                                <th>PO Tags</th>
                                <th>Bank Assignments</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectPOs.map(po => {
                                const isExpanded = expandedRow === po.id;
                                const poNmrs = nmrDocuments.filter(n => n.poId === po.id);
                                const pendingNmrs = poNmrs.filter(n => !['APPROVED', 'CODE-4', 'CODE-D'].includes(n.status));

                                return (
                                    <React.Fragment key={po.id}>
                                        <tr
                                            style={{ cursor: 'pointer', background: isExpanded ? 'rgba(99,102,241,0.05)' : 'transparent' }}
                                            onClick={() => setExpandedRow(isExpanded ? null : po.id)}
                                        >
                                            <td>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                                            <td className="text-muted">{po.id}</td>
                                            <td className="highlight-text">{po.poNumber}</td>
                                            <td>{po.poDate}</td>
                                            <td>{po.poRev}</td>
                                            <td>
                                                <span className={`badge ${customerDivision === 'DIRECT' ? 'badge-success' : 'badge-info'}`}>
                                                    {customerDivision}
                                                </span>
                                            </td>
                                            <td>
                                                {poNmrs.length > 0 ? (
                                                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                                        <span className="badge" style={{ background: 'var(--accent-primary)', color: 'white', fontSize: '0.7rem' }}>{poNmrs.length}</span>
                                                        {pendingNmrs.length > 0 && (
                                                            <span className="badge badge-warning" style={{ fontSize: '0.7rem' }} title="Pending Approval">
                                                                {pendingNmrs.length} P
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : <span className="text-muted">—</span>}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                    {(po.poTags || []).length > 0
                                                        ? (po.poTags || []).map((tag, i) => (
                                                            <span key={i} style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                                                background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)',
                                                                borderRadius: '999px', padding: '0.1rem 0.5rem',
                                                                fontSize: '0.75rem', border: '1px solid rgba(99,102,241,0.2)',
                                                            }}><Tag size={9} />{tag}</span>
                                                        ))
                                                        : <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                                    }
                                                </div>
                                            </td>
                                            <td>
                                                {(po.bankAssignments && po.bankAssignments.length > 0)
                                                    ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                        {po.bankAssignments.map((bank, i) => (
                                                            <span key={i} className="badge badge-info" style={{ fontSize: '0.75rem' }}>{bank}</span>
                                                        ))}
                                                    </div>
                                                    : <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                                }
                                            </td>
                                            <td onClick={e => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <button className="icon-btn-small" onClick={() => openEdit(po)} title="Edit PO" style={{ color: 'var(--text-secondary)' }}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="icon-btn-small" onClick={() => handleDelete(po.id)} title="Delete PO" style={{ color: 'var(--danger)' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                                <td colSpan="11" style={{ padding: '0' }}>
                                                    <div style={{ padding: '1.5rem', borderLeft: '4px solid var(--accent-primary)', margin: '0.5rem 1rem 1rem 1.5rem', background: 'rgba(255,255,255,0.3)', borderRadius: '0 8px 8px 0' }}>
                                                        <POLineItemsForm poId={po.id} projectId={projectId} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                            {projectPOs.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="text-center py-4 text-muted">No Purchase Orders associated with this Project.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel create-form-panel animate-fade-in" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="form-header">
                        <h3>{editingPO ? `Edit Purchase Order: ${editingPO.id}` : 'Record Purchase Order Header'}</h3>
                        <button className="icon-btn-small" onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleCreateOrUpdate} className="so-form">
                        <div className="form-grid">
                            {/* Row 1: PO Number + PO Date */}
                            <div className="input-group">
                                <label className="input-label">Customer PO Number</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.poNumber} onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })} required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">PO Date</label>
                                <input
                                    type="date" className="premium-input"
                                    value={formData.poDate} onChange={(e) => setFormData({ ...formData, poDate: e.target.value })} required
                                />
                            </div>

                            {/* Row 2: PO Rev + Division (read-only from Customer Master) */}
                            <div className="input-group">
                                <label className="input-label">PO Revision Number</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.poRev} onChange={(e) => setFormData({ ...formData, poRev: e.target.value })} required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Division <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.78rem' }}>(from Customer Master)</span></label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '0.5rem' }}>
                                    <span className={`badge ${customerDivision === 'DIRECT' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.88rem', padding: '0.35rem 1rem' }}>
                                        {customerDivision}
                                    </span>
                                    {customer
                                        ? <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>via <strong>{customer.name}</strong></span>
                                        : <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No customer linked to project</span>
                                    }
                                </div>
                            </div>

                            {/* Row 3: PO Tags (full width) */}
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Customer PO Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(press Enter to add)</span></label>
                                <TagInput
                                    tags={formData.poTags}
                                    onChange={(tags) => setFormData({ ...formData, poTags: tags })}
                                    placeholder="e.g. Phase-1, Revision-A..."
                                />
                            </div>

                            {/* Row 4: Bank Assignments */}
                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Bank Assignments <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(KSA Banks - press Enter to add custom)</span></label>
                                <BankInput
                                    banks={formData.bankAssignments}
                                    onChange={(banks) => setFormData({ ...formData, bankAssignments: banks })}
                                    availableBanks={DEFAULT_BANKS}
                                />
                            </div>
                        </div>

                        {/* Contacts Section */}
                        <div className="contacts-section" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Customer Contacts</h4>
                                <button type="button" className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={handleAddContact}>
                                    <Plus size={14} /> Add Contact
                                </button>
                            </div>

                            {formData.contacts.map((contact, index) => (
                                <div key={index} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
                                    <div className="input-group" style={{ margin: 0, flex: 1 }}>
                                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Name</label>
                                        <input type="text" className="premium-input" value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} required />
                                    </div>
                                    <div className="input-group" style={{ margin: 0, flex: 1 }}>
                                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Email</label>
                                        <input type="email" className="premium-input" value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)} required />
                                    </div>
                                    <div className="input-group" style={{ margin: 0, flex: 1 }}>
                                        <label className="input-label" style={{ fontSize: '0.75rem' }}>Phone</label>
                                        <input type="text" className="premium-input" value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} required />
                                    </div>
                                    {formData.contacts.length > 1 && (
                                        <button type="button" className="icon-btn-small" onClick={() => handleRemoveContact(index)} style={{ marginBottom: '0.3rem', border: 'none', background: 'none' }}>
                                            <X size={16} color="var(--danger)" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                            <button type="submit" className="btn-primary"><Save size={18} /> {editingPO ? 'Update PO Header' : 'Save PO Header'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default POHeaderForm;
