import React, { useState } from 'react';
import { Plus, X, FileText, ChevronRight, Check, Edit, Trash2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import POLineItemsForm from './POLineItemsForm';

const POHeaderForm = ({ projectId }) => {
    const { purchaseOrders, addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } = useStore();
    const [showCreate, setShowCreate] = useState(false);
    const [selectedPO, setSelectedPO] = useState(null);
    const [editingPO, setEditingPO] = useState(null);

    const initialFormState = {
        poNumber: '',
        poDate: new Date().toISOString().split('T')[0],
        poRev: '0',
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
        const newContacts = formData.contacts.filter((_, i) => i !== index);
        setFormData({ ...formData, contacts: newContacts });
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
                                <th>Internal ID</th>
                                <th>Customer PO</th>
                                <th>Date</th>
                                <th>Rev</th>
                                <th>Contacts</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projectPOs.map(po => (
                                <tr key={po.id}>
                                    <td className="text-muted">{po.id}</td>
                                    <td className="highlight-text">{po.poNumber}</td>
                                    <td>{po.poDate}</td>
                                    <td>{po.poRev}</td>
                                    <td>{po.contacts.length} Contact(s)</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => setSelectedPO(po)}>
                                                Manage Line Items
                                            </button>
                                            <button className="icon-btn-small" onClick={() => openEdit(po)} title="Edit PO" style={{ color: 'var(--text-secondary)' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="icon-btn-small" onClick={() => handleDelete(po.id)} title="Delete PO" style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projectPOs.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-muted">No Purchase Orders associated with this Project.</td>
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
                            <div className="input-group">
                                <label className="input-label">PO Revision Number</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.poRev} onChange={(e) => setFormData({ ...formData, poRev: e.target.value })} required
                                />
                            </div>
                        </div>

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
