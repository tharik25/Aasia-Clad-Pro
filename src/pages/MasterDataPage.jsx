import React, { useState } from 'react';
import { Search, Plus, Building2, Package, PowerSquare, Factory, Trash2, Save, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import './MasterDataPage.css';

const MasterDataPage = () => {
    const {
        customers, vendors, products, workstations,
        addCustomer, updateCustomer, deleteCustomer,
        addVendor, updateVendor, deleteVendor,
        addProduct, updateProduct, deleteProduct,
        addWorkstation, updateWorkstation, deleteWorkstation
    } = useStore();

    const [activeTab, setActiveTab] = useState('customers');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Dynamic form states based on active tab
    const [customerData, setCustomerData] = useState({ name: '', industry: '', country: '', phone: '', email: '' });
    const [vendorData, setVendorData] = useState({ name: '', category: '', contactPerson: '', phone: '', email: '' });
    const [productData, setProductData] = useState({ code: '', name: '', category: 'Raw Material', uom: 'EA' });
    const [workstationData, setWorkstationData] = useState({ name: '', type: 'Weld Overlay', status: 'Active' });

    const resetForms = () => {
        setCustomerData({ name: '', industry: '', country: '', phone: '', email: '' });
        setVendorData({ name: '', category: '', contactPerson: '', phone: '', email: '' });
        setProductData({ code: '', name: '', category: 'Raw Material', uom: 'EA' });
        setWorkstationData({ name: '', type: 'Weld Overlay', status: 'Active' });
        setEditingItem(null);
        setShowCreate(false);
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
            case 'customers':
                const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                    <div className="animate-fade-in">
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
                        <div className="glass-panel table-container">
                            <table className="data-table selectable-rows">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Industry</th>
                                        <th>Country</th>
                                        <th>Contact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map(c => (
                                        <tr key={c.id} onClick={() => openEdit(c, 'customer')} style={{ cursor: 'pointer' }} className={editingItem?.id === c.id ? 'active-row' : ''}>
                                            <td className="highlight-text">{c.id}</td>
                                            <td>{c.name}</td>
                                            <td>{c.industry}</td>
                                            <td>{c.country}</td>
                                            <td>{c.email} | {c.phone}</td>
                                        </tr>
                                    ))}
                                    {filteredCustomers.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No customers found.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
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
