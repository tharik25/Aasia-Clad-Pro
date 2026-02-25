import React from 'react';
import { PackagePlus } from 'lucide-react';
import { useStore } from '../store/useStore';

const InventoryPage = () => {
    const { materials } = useStore();

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Inventory Management</h2>
                    <p className="subtitle">Track procured and customer free-issued materials.</p>
                </div>
                <button className="btn-primary">
                    <PackagePlus size={18} /> Receive Material
                </button>
            </div>

            <div className="glass-panel table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Mat ID</th>
                            <th>Name / Spec</th>
                            <th>Type</th>
                            <th>Quantity</th>
                            <th>Allocated To</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {materials.map(mat => (
                            <tr key={mat.id}>
                                <td className="highlight-text">{mat.id}</td>
                                <td>{mat.name}</td>
                                <td>
                                    <span className={`badge badge-${mat.type === 'Free-Issued' ? 'info' : 'warning'}`}>
                                        {mat.type}
                                    </span>
                                </td>
                                <td>{mat.quantity} {mat.unit}</td>
                                <td>{mat.projectAllocated || 'Unallocated'}</td>
                                <td><span className="badge badge-success">In Stock</span></td>
                            </tr>
                        ))}
                        {materials.length === 0 && (
                            <tr>
                                <td colSpan="6" className="text-center py-4 text-muted">No materials found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryPage;
