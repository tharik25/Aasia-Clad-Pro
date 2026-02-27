import React, { useState } from 'react';
import { Plus, MoreVertical, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import './SalesOrdersPage.css';

const SalesOrdersPage = () => {
    const { salesOrders, addSalesOrder, customers } = useStore();
    const [showCreate, setShowCreate] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customer: customers.length > 0 ? customers[0].name : '', poNumber: '', date: '', totalValue: 0, items: []
    });

    const handleCreate = (e) => {
        e.preventDefault();
        const newOrder = {
            id: `SO-2024-${String(salesOrders.length + 1).padStart(3, '0')}`,
            ...formData,
            status: 'Pending',
        };
        addSalesOrder(newOrder);
        setShowCreate(false);
        setFormData({ customer: customers.length > 0 ? customers[0].name : '', poNumber: '', date: '', totalValue: 0, items: [] });
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Sales Orders</h2>
                    <p className="subtitle">Manage customer Purchase Orders and requirements.</p>
                </div>
                {!showCreate && (
                    <button className="btn-primary" onClick={() => setShowCreate(true)}>
                        <Plus size={18} /> New Sales Order
                    </button>
                )}
            </div>

            {!showCreate ? (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>SO ID</th>
                                <th>Customer</th>
                                <th>PO Number</th>
                                <th>Date</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesOrders.map(so => (
                                <tr key={so.id}>
                                    <td className="highlight-text">{so.id}</td>
                                    <td>{so.customer}</td>
                                    <td>{so.poNumber}</td>
                                    <td>{so.date}</td>
                                    <td>${Number(so.totalValue).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge badge-${so.status === 'Approved' ? 'success' : 'warning'}`}>
                                            {so.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="icon-btn-small" title="Options">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {salesOrders.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">No Sales Orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel create-form-panel animate-fade-in">
                    <div className="form-header">
                        <h3>Create New Sales Order</h3>
                        <button className="icon-btn-small" onClick={() => setShowCreate(false)}>
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleCreate} className="so-form">
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Customer Name</label>
                                <select
                                    className="premium-input select-input"
                                    value={formData.customer}
                                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                                    required
                                >
                                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="input-group">
                                <label className="input-label">PO Number</label>
                                <input
                                    type="text"
                                    className="premium-input"
                                    value={formData.poNumber}
                                    onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Date Received</label>
                                <input
                                    type="date"
                                    className="premium-input"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Total Estimated Value ($)</label>
                                <input
                                    type="number"
                                    className="premium-input"
                                    value={formData.totalValue}
                                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button type="submit" className="btn-primary"><Check size={18} /> Save Order</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SalesOrdersPage;
