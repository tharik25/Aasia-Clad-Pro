import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Building2, Package, PowerSquare, Factory, Trash2, Save, X, FolderKanban, ChevronRight, FileText, TrendingUp, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import './MasterDataPage.css';

const MasterDataPage = () => {
    const {
        customers, vendors, products, workstations,
        addCustomer, updateCustomer, deleteCustomer,
        addVendor, updateVendor, deleteVendor,
        addProduct, updateProduct, deleteProduct,
        addWorkstation, updateWorkstation, deleteWorkstation,
        projects, purchaseOrders, poLineItems,
        setSelectedProjectId, setSelectedPOId
    } = useStore();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('customers');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null); // for master-detail

    // Dynamic form states based on active tab
    const [customerData, setCustomerData] = useState({ name: '', industry: '', country: '', phone: '', email: '', division: 'DIRECT' });
    const [vendorData, setVendorData] = useState({ name: '', category: '', contactPerson: '', phone: '', email: '' });
    const [productData, setProductData] = useState({ code: '', name: '', category: 'Raw Material', uom: 'EA' });
    const [workstationData, setWorkstationData] = useState({ name: '', type: 'Weld Overlay', status: 'Active' });

    const resetForms = () => {
        setCustomerData({ name: '', industry: '', country: '', phone: '', email: '', division: 'DIRECT' });
        setVendorData({ name: '', category: '', contactPerson: '', phone: '', email: '' });
        setProductData({ code: '', name: '', category: 'Raw Material', uom: 'EA' });
        setWorkstationData({ name: '', type: 'Weld Overlay', status: 'Active' });
        setEditingItem(null);
        setShowCreate(false);
        setSelectedCustomer(null);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchQuery('');
        resetForms();
    };

    const handleCreateOrUpdateCustomer = (e) => {
        e.preventDefault();
        if (editingItem) updateCustomer(editingItem.id, customerData);
        else addCustomer(customerData);
        resetForms();
    };

    const handleCreateOrUpdateVendor = (e) => {
        e.preventDefault();
        if (editingItem) updateVendor(editingItem.id, vendorData);
        else addVendor(vendorData);
        resetForms();
    };

    const handleCreateOrUpdateProduct = (e) => {
        e.preventDefault();
        if (editingItem) updateProduct(editingItem.id, productData);
        else addProduct(productData);
        resetForms();
    };

    const handleCreateOrUpdateWorkstation = (e) => {
        e.preventDefault();
        if (editingItem) updateWorkstation(editingItem.id, workstationData);
        else addWorkstation(workstationData);
        resetForms();
    };

    const handleDelete = (id, type) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        if (type === 'customer') deleteCustomer(id);
        if (type === 'vendor') deleteVendor(id);
        if (type === 'product') deleteProduct(id);
        if (type === 'workstation') deleteWorkstation(id);
        resetForms();
    };

    const openEdit = (item, type) => {
        setEditingItem(item);
        setShowCreate(true);
        if (type === 'customer') setCustomerData(item);
        if (type === 'vendor') setVendorData(item);
        if (type === 'product') setProductData(item);
        if (type === 'workstation') setWorkstationData(item);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'customers': {
                const RATES = { USD: 3.75, SAR: 1, EUR: 4.05, GBP: 4.73 };
                const filteredCustomers = customers.filter(c =>
                    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.id.toLowerCase().includes(searchQuery.toLowerCase())
                );

                // Compute per-customer rollup for the list column
                const custStats = (custName) => {
                    const custProjects = projects.filter(p => p.customer === custName);
                    const poIds = purchaseOrders.filter(po => custProjects.some(p => p.id === po.projectId)).map(po => po.id);
                    const lis = poLineItems.filter(li => poIds.includes(li.poId));
                    const totalQty = lis.reduce((s, li) => s + (Number(li.quantity) || 0), 0);
                    const totalSAR = lis.reduce((s, li) => {
                        if (li.basePriceSAR && !isNaN(Number(li.basePriceSAR))) return s + Number(li.basePriceSAR);
                        const src = li.grandTotal || li.netTotal || li.totalPrice || '';
                        return s + (src !== '' ? Number(src) * (RATES[li.currency || 'USD'] || 1) : 0);
                    }, 0);
                    return { projectCount: custProjects.length, totalQty, totalSAR };
                };

                return (
                    <div className="animate-fade-in">
                        {/* ── Create / Edit Form ─────────────────────────── */}
                        {showCreate && (
                            <form onSubmit={handleCreateOrUpdateCustomer} className="glass-panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4>{editingItem ? 'Edit Customer' : 'New Customer'}</h4>
                                    <button type="button" className="icon-btn-small" onClick={resetForms} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                                </div>
                                <div className="md-form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Company Name</label>
                                        <input type="text" className="premium-input" value={customerData.name} onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Industry</label>
                                        <input type="text" className="premium-input" value={customerData.industry} onChange={(e) => setCustomerData({ ...customerData, industry: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Country</label>
                                        <input type="text" className="premium-input" value={customerData.country} onChange={(e) => setCustomerData({ ...customerData, country: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Phone</label>
                                        <input type="text" className="premium-input" value={customerData.phone} onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Email</label>
                                        <input type="email" className="premium-input" value={customerData.email} onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Division</label>
                                        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', paddingTop: '0.5rem' }}>
                                            {['DIRECT', 'INDIRECT'].map(opt => (
                                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                    <input
                                                        type="radio"
                                                        name="customerDivision"
                                                        value={opt}
                                                        checked={customerData.division === opt}
                                                        onChange={() => setCustomerData({ ...customerData, division: opt })}
                                                    />
                                                    {opt}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    {editingItem && (
                                        <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(editingItem.id, 'customer')}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    )}
                                    <button type="button" className="btn-secondary" onClick={resetForms}>Cancel</button>
                                    <button type="submit" className="btn-primary"><Save size={16} /> {editingItem ? 'Update' : 'Save'} Customer</button>
                                </div>
                            </form>
                        )}

                        {/* ── Master-Detail layout ───────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: selectedCustomer ? '340px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

                            {/* LEFT — Customer list */}
                            <div className="glass-panel table-container" style={{ padding: 0, overflow: 'hidden' }}>
                                <table className="data-table selectable-rows">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Division</th>
                                            <th style={{ textAlign: 'right' }}>Projects</th>
                                            <th style={{ textAlign: 'right' }}>Total SAR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCustomers.map(c => {
                                            const s = custStats(c.name);
                                            const isSelected = selectedCustomer?.id === c.id;
                                            return (
                                                <tr
                                                    key={c.id}
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setShowCreate(false);
                                                        setEditingItem(null);
                                                    }}
                                                    style={{ cursor: 'pointer', background: isSelected ? 'rgba(99,102,241,0.08)' : '' }}
                                                    className={isSelected ? 'active-row' : ''}
                                                >
                                                    <td className="highlight-text" style={{ fontSize: '0.78rem' }}>{c.id}</td>
                                                    <td style={{ fontWeight: isSelected ? 600 : 400 }}>{c.name}</td>
                                                    <td>
                                                        <span className={`badge ${c.division === 'INDIRECT' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.72rem' }}>
                                                            {c.division || 'DIRECT'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        {s.projectCount > 0
                                                            ? <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>{s.projectCount} proj</span>
                                                            : <span className="text-muted" style={{ fontSize: '0.78rem' }}>—</span>
                                                        }
                                                    </td>
                                                    <td style={{ textAlign: 'right', fontSize: '0.82rem', fontWeight: 600, color: s.totalSAR > 0 ? 'var(--accent-secondary, #34d399)' : 'var(--text-muted)' }}>
                                                        {s.totalSAR > 0 ? s.totalSAR.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredCustomers.length === 0 && (
                                            <tr><td colSpan="4" className="text-center py-4 text-muted">No customers found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* RIGHT — Customer detail + linked data */}
                            {selectedCustomer && (() => {
                                const custProjects = projects.filter(p => p.customer === selectedCustomer.name);

                                return (
                                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                        {/* ── Customer Info Card ─────────── */}
                                        <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                    <div style={{
                                                        width: 48, height: 48, borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary, #6366f1))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 700, fontSize: '1.1rem', color: '#fff', flexShrink: 0
                                                    }}>
                                                        {selectedCustomer.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 style={{ margin: 0 }}>{selectedCustomer.name}</h3>
                                                        <p className="subtitle" style={{ margin: 0 }}>{selectedCustomer.industry} · {selectedCustomer.country}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                                                        onClick={() => { setEditingItem(selectedCustomer); setCustomerData(selectedCustomer); setShowCreate(true); }}>
                                                        <Save size={14} /> Edit
                                                    </button>
                                                    <button className="icon-btn-small" style={{ color: 'var(--text-muted)' }} onClick={() => setSelectedCustomer(null)}>
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                                                <div><span className="text-muted">ID: </span><strong>{selectedCustomer.id}</strong></div>
                                                <div><span className="text-muted">Email: </span><strong>{selectedCustomer.email || '—'}</strong></div>
                                                <div><span className="text-muted">Phone: </span><strong>{selectedCustomer.phone || '—'}</strong></div>
                                            </div>
                                        </div>

                                        {/* ── Summary KPIs ──────────────── */}
                                        {(() => {
                                            const poIds = purchaseOrders.filter(po => custProjects.some(p => p.id === po.projectId)).map(po => po.id);
                                            const lis = poLineItems.filter(li => poIds.includes(li.poId));
                                            const totalQty = lis.reduce((s, li) => s + (Number(li.quantity) || 0), 0);
                                            const totalSAR = lis.reduce((s, li) => {
                                                if (li.basePriceSAR && !isNaN(Number(li.basePriceSAR))) return s + Number(li.basePriceSAR);
                                                const src = li.grandTotal || li.netTotal || li.totalPrice || '';
                                                return s + (src !== '' ? Number(src) * (RATES[li.currency || 'USD'] || 1) : 0);
                                            }, 0);
                                            const allDates = lis.map(li => li.deliveryDate).filter(Boolean).sort();
                                            const maxDate = allDates[allDates.length - 1] || null;
                                            return (
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                                    {[
                                                        { label: 'Projects', value: custProjects.length, color: 'var(--accent-primary)' },
                                                        { label: 'Total POs', value: poIds.length, color: 'var(--accent-primary)' },
                                                        { label: 'Total Qty', value: totalQty.toLocaleString(), color: 'var(--accent-primary)' },
                                                        { label: 'Total Base (SAR)', value: totalSAR > 0 ? totalSAR.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—', color: 'var(--accent-secondary, #34d399)' },
                                                    ].map(({ label, value, color }) => (
                                                        <div key={label} className="glass-panel" style={{ textAlign: 'center', padding: '1rem' }}>
                                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</div>
                                                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color }}>{value}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })()}

                                        {/* ── Projects & POs ────────────── */}
                                        <div className="glass-panel" style={{ padding: '1.25rem' }}>
                                            {(() => {
                                                const globalTotalSAR = custProjects.reduce((total, p) => {
                                                    const pPOs = purchaseOrders.filter(po => po.projectId === p.id);
                                                    const pLIs = poLineItems.filter(li => pPOs.some(po => po.id === li.poId));
                                                    return total + pLIs.reduce((sum, li) => {
                                                        if (li.basePriceSAR && !isNaN(Number(li.basePriceSAR))) return sum + Number(li.basePriceSAR);
                                                        const src = li.grandTotal || li.netTotal || li.totalPrice || '';
                                                        return sum + (src !== '' ? Number(src) * (RATES[li.currency || 'USD'] || 1) : 0);
                                                    }, 0);
                                                }, 0);

                                                return (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', background: 'rgba(99,102,241,0.04)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                                                            <FolderKanban size={18} color="var(--accent-primary)" /> Associated Projects
                                                        </h4>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Total Value</span>
                                                            <div style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                                                                {globalTotalSAR.toLocaleString('en-US', { maximumFractionDigits: 2 })} SAR
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {custProjects.length === 0 ? (
                                                <p className="text-muted" style={{ textAlign: 'center', padding: '1.5rem 0' }}>No projects linked to this customer yet.</p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {custProjects.map(proj => {
                                                        const projPOs = purchaseOrders.filter(po => po.projectId === proj.id);
                                                        const projLIs = poLineItems.filter(li => projPOs.some(po => po.id === li.poId));
                                                        const projQty = projLIs.reduce((s, li) => s + (Number(li.quantity) || 0), 0);
                                                        const projDates = projLIs.map(li => li.deliveryDate).filter(Boolean).sort();
                                                        const projMaxDate = projDates[projDates.length - 1] || null;
                                                        const projSAR = projLIs.reduce((s, li) => {
                                                            if (li.basePriceSAR && !isNaN(Number(li.basePriceSAR))) return s + Number(li.basePriceSAR);
                                                            const src = li.grandTotal || li.netTotal || li.totalPrice || '';
                                                            return s + (src !== '' ? Number(src) * (RATES[li.currency || 'USD'] || 1) : 0);
                                                        }, 0);
                                                        const projNameStr = Array.isArray(proj.name) ? proj.name.join(', ') : (proj.name || proj.id);

                                                        return (
                                                            <div key={proj.id} style={{ border: '1px solid var(--glass-border)', borderRadius: '10px', overflow: 'hidden' }}>
                                                                {/* Project header row */}
                                                                <div
                                                                    style={{
                                                                        background: 'rgba(99,102,241,0.07)', padding: '0.75rem 1rem',
                                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                        borderBottom: projPOs.length > 0 ? '1px solid var(--glass-border)' : 'none',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                    onClick={() => {
                                                                        setSelectedProjectId(proj.id);
                                                                        navigate('/projects');
                                                                    }}
                                                                >
                                                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                                        <span className="project-id-badge" style={{ fontSize: '0.75rem' }}>{proj.id}</span>
                                                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>{projNameStr}</span>
                                                                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{proj.projectType}</span>
                                                                        <ChevronRight size={14} className="text-muted" />
                                                                    </div>
                                                                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                                        {projQty > 0 && <span>Qty: <strong style={{ color: 'var(--text-secondary)' }}>{projQty}</strong></span>}
                                                                        {projMaxDate && <span>Latest: <strong style={{ color: 'var(--text-secondary)' }}>{projMaxDate}</strong></span>}
                                                                        {projSAR > 0 && <span style={{ color: 'var(--accent-secondary, #34d399)', fontWeight: 700 }}>{projSAR.toLocaleString('en-US', { maximumFractionDigits: 2 })} SAR</span>}
                                                                    </div>
                                                                </div>

                                                                {/* POs sub-table */}
                                                                {projPOs.length > 0 && (
                                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                                                                        <thead>
                                                                            <tr style={{ background: 'rgba(0,0,0,0.06)' }}>
                                                                                <th style={{ padding: '0.4rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>PO Number</th>
                                                                                <th style={{ padding: '0.4rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>PO Date</th>
                                                                                <th style={{ padding: '0.4rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Division</th>
                                                                                <th style={{ padding: '0.4rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500 }}>Grade</th>
                                                                                <th style={{ padding: '0.4rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Line Items</th>
                                                                                <th style={{ padding: '0.4rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Qty</th>
                                                                                <th style={{ padding: '0.4rem 1rem', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 500 }}>Base (SAR)</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {projPOs.map(po => {
                                                                                const poLIs = poLineItems.filter(li => li.poId === po.id);
                                                                                const poQty = poLIs.reduce((s, li) => s + (Number(li.quantity) || 0), 0);
                                                                                const poSAR = poLIs.reduce((s, li) => {
                                                                                    if (li.basePriceSAR && !isNaN(Number(li.basePriceSAR))) return s + Number(li.basePriceSAR);
                                                                                    const src = li.grandTotal || li.netTotal || li.totalPrice || '';
                                                                                    return s + (src !== '' ? Number(src) * (RATES[li.currency || 'USD'] || 1) : 0);
                                                                                }, 0);
                                                                                return (
                                                                                    <tr
                                                                                        key={po.id}
                                                                                        style={{ borderTop: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            setSelectedProjectId(proj.id);
                                                                                            setSelectedPOId(po.id);
                                                                                            navigate('/projects');
                                                                                        }}
                                                                                    >
                                                                                        <td style={{ padding: '0.5rem 1rem', fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'underline' }}>{po.poNumber}</td>
                                                                                        <td style={{ padding: '0.5rem 1rem', color: 'var(--text-secondary)' }}>{po.poDate}</td>
                                                                                        <td style={{ padding: '0.5rem 1rem' }}>
                                                                                            <span className={`badge ${po.division === 'INDIRECT' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                                                                                                {po.division || 'DIRECT'}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td style={{ padding: '0.5rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{po.gradeAssignment || '—'}</td>
                                                                                        <td style={{ padding: '0.5rem 1rem', textAlign: 'right', color: 'var(--text-muted)' }}>{poLIs.length}</td>
                                                                                        <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 600 }}>{poQty || '—'}</td>
                                                                                        <td style={{ padding: '0.5rem 1rem', textAlign: 'right', fontWeight: 700, color: poSAR > 0 ? 'var(--accent-secondary, #34d399)' : 'var(--text-muted)' }}>
                                                                                            {poSAR > 0 ? poSAR.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '—'}
                                                                                        </td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                )}
                                                                {projPOs.length === 0 && (
                                                                    <p className="text-muted" style={{ padding: '0.6rem 1rem', fontSize: '0.82rem', margin: 0 }}>No POs yet for this project.</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                );
            }
            case 'vendors':
                const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.id.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                    <div className="animate-fade-in">
                        {showCreate && (
                            <form onSubmit={handleCreateOrUpdateVendor} className="glass-panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4>{editingItem ? 'Edit Vendor' : 'New Vendor'}</h4>
                                    <button type="button" className="icon-btn-small" onClick={resetForms} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                                </div>
                                <div className="md-form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Vendor Name</label>
                                        <input type="text" className="premium-input" value={vendorData.name} onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Supply Category</label>
                                        <input type="text" className="premium-input" value={vendorData.category} onChange={(e) => setVendorData({ ...vendorData, category: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Contact Person</label>
                                        <input type="text" className="premium-input" value={vendorData.contactPerson} onChange={(e) => setVendorData({ ...vendorData, contactPerson: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Phone</label>
                                        <input type="text" className="premium-input" value={vendorData.phone} onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Email</label>
                                        <input type="email" className="premium-input" value={vendorData.email} onChange={(e) => setVendorData({ ...vendorData, email: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    {editingItem && (
                                        <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(editingItem.id, 'vendor')}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    )}
                                    <button type="button" className="btn-secondary" onClick={resetForms}>Cancel</button>
                                    <button type="submit" className="btn-primary"><Save size={16} /> {editingItem ? 'Update' : 'Save'} Vendor</button>
                                </div>
                            </form>
                        )}
                        <div className="glass-panel table-container">
                            <table className="data-table selectable-rows">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Vendor Name</th>
                                        <th>Category</th>
                                        <th>Contact Person</th>
                                        <th>Contact Info</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredVendors.map(v => (
                                        <tr key={v.id} onClick={() => openEdit(v, 'vendor')} style={{ cursor: 'pointer' }} className={editingItem?.id === v.id ? 'active-row' : ''}>
                                            <td className="highlight-text">{v.id}</td>
                                            <td>{v.name}</td>
                                            <td>{v.category}</td>
                                            <td>{v.contactPerson}</td>
                                            <td>{v.email} | {v.phone}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="icon-btn-small"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(v.id, 'vendor'); }}
                                                    style={{ color: 'var(--danger)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredVendors.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No vendors found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'products':
                const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                    <div className="animate-fade-in">
                        {showCreate && (
                            <form onSubmit={handleCreateOrUpdateProduct} className="glass-panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4>{editingItem ? 'Edit Product' : 'New Product'}</h4>
                                    <button type="button" className="icon-btn-small" onClick={resetForms} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                                </div>
                                <div className="md-form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Product Code</label>
                                        <input type="text" className="premium-input" value={productData.code} onChange={(e) => setProductData({ ...productData, code: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Product Name</label>
                                        <input type="text" className="premium-input" value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Category</label>
                                        <select className="premium-input select-input" value={productData.category} onChange={(e) => setProductData({ ...productData, category: e.target.value })} required>
                                            <option value="Raw Material">Raw Material</option>
                                            <option value="Consumable">Consumable</option>
                                            <option value="Semi-Finished">Semi-Finished</option>
                                            <option value="Final">Final</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">UOM</label>
                                        <input type="text" className="premium-input" value={productData.uom} onChange={(e) => setProductData({ ...productData, uom: e.target.value })} required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    {editingItem && (
                                        <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(editingItem.id, 'product')}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    )}
                                    <button type="button" className="btn-secondary" onClick={resetForms}>Cancel</button>
                                    <button type="submit" className="btn-primary"><Save size={16} /> {editingItem ? 'Update' : 'Save'} Product</button>
                                </div>
                            </form>
                        )}
                        <div className="glass-panel table-container">
                            <table className="data-table selectable-rows">
                                <thead>
                                    <tr>
                                        <th>Internal ID</th>
                                        <th>Product Code</th>
                                        <th>Name / Description</th>
                                        <th>Category</th>
                                        <th>UOM</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} onClick={() => openEdit(p, 'product')} style={{ cursor: 'pointer' }} className={editingItem?.id === p.id ? 'active-row' : ''}>
                                            <td className="text-muted">{p.id}</td>
                                            <td className="highlight-text">{p.code}</td>
                                            <td>{p.name}</td>
                                            <td><span className={`badge ${p.category === 'Consumable' ? 'badge-info' : 'badge-success'}`}>{p.category}</span></td>
                                            <td>{p.uom}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    className="icon-btn-small"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id, 'product'); }}
                                                    style={{ color: 'var(--danger)' }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No products found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'workstations':
                const filteredWorkstations = workstations.filter(w => w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.id.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                    <div className="animate-fade-in">
                        {showCreate && (
                            <form onSubmit={handleCreateOrUpdateWorkstation} className="glass-panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4>{editingItem ? 'Edit Workstation' : 'New Workstation'}</h4>
                                    <button type="button" className="icon-btn-small" onClick={resetForms} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                                </div>
                                <div className="md-form-grid">
                                    <div className="input-group">
                                        <label className="input-label">Workstation Name</label>
                                        <input type="text" className="premium-input" value={workstationData.name} onChange={(e) => setWorkstationData({ ...workstationData, name: e.target.value })} required />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Type / Department</label>
                                        <select className="premium-input select-input" value={workstationData.type} onChange={(e) => setWorkstationData({ ...workstationData, type: e.target.value })} required>
                                            <option value="Weld Overlay">Weld Overlay</option>
                                            <option value="Machining">Machining</option>
                                            <option value="Assembly">Assembly</option>
                                            <option value="Quality">Quality / NDE</option>
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Status</label>
                                        <select className="premium-input select-input" value={workstationData.status} onChange={(e) => setWorkstationData({ ...workstationData, status: e.target.value })} required>
                                            <option value="Active">Active</option>
                                            <option value="Maintenance">Maintenance</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                                    {editingItem && (
                                        <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(editingItem.id, 'workstation')}>
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    )}
                                    <button type="button" className="btn-secondary" onClick={resetForms}>Cancel</button>
                                    <button type="submit" className="btn-primary"><Save size={16} /> {editingItem ? 'Update' : 'Save'} Workstation</button>
                                </div>
                            </form>
                        )}
                        <div className="glass-panel table-container">
                            <table className="data-table selectable-rows">
                                <thead>
                                    <tr>
                                        <th>WS ID</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWorkstations.map(w => (
                                        <tr key={w.id} onClick={() => openEdit(w, 'workstation')} style={{ cursor: 'pointer' }} className={editingItem?.id === w.id ? 'active-row' : ''}>
                                            <td className="highlight-text">{w.id}</td>
                                            <td>{w.name}</td>
                                            <td>{w.type}</td>
                                            <td>
                                                <span className={`badge ${w.status === 'Active' ? 'badge-success' : w.status === 'Maintenance' ? 'badge-warning' : 'badge-danger'}`}>
                                                    {w.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredWorkstations.length === 0 && <tr><td colSpan="4" className="text-center py-4 text-muted">No workstations found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="page-container animate-fade-in master-data-container">
            <div className="page-header">
                <div>
                    <h2>Master Data Management</h2>
                    <p className="subtitle">Centralized repository for Customers, Vendors, Products, and Shop Floor Workstations.</p>
                </div>
            </div>

            <div className="md-tabs">
                <div className={`md-tab ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => handleTabChange('customers')}>
                    <Building2 size={16} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} /> Customers
                </div>
                <div className={`md-tab ${activeTab === 'vendors' ? 'active' : ''}`} onClick={() => handleTabChange('vendors')}>
                    <Factory size={16} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} /> Vendors
                </div>
                <div className={`md-tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabChange('products')}>
                    <Package size={16} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} /> Products
                </div>
                <div className={`md-tab ${activeTab === 'workstations' ? 'active' : ''}`} onClick={() => handleTabChange('workstations')}>
                    <PowerSquare size={16} style={{ display: 'inline', marginRight: '6px', marginBottom: '-2px' }} /> Workstations
                </div>
            </div>

            <div className="md-table-actions">
                <div className="md-search">
                    <Search className="search-icon" size={16} />
                    <input
                        type="text"
                        className="md-search-input"
                        placeholder={`Search ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {!showCreate && (
                    <button className="btn-primary" onClick={() => setShowCreate(true)}>
                        <Plus size={16} /> Add {activeTab.slice(0, -1)}
                    </button>
                )}
            </div>

            {renderTabContent()}

        </div>
    );
};

export default MasterDataPage;
