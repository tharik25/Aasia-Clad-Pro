import React, { useState } from 'react';
import { Plus, Check, X, Link as LinkIcon, Search, Edit, Trash2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';

const AssemblyPage = () => {
    const { spools, assemblyJoints, addAssemblyJoint, updateAssemblyJoint, deleteAssemblyJoint } = useStore();
    const [showCreate, setShowCreate] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingJoint, setEditingJoint] = useState(null);

    // Available components are those that have finished Cladding (have a Sage Code)
    const availableComponents = spools.filter(s => s.sageCode);

    const filteredJoints = assemblyJoints.filter(j =>
        j.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.component1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.component2.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const initialFormState = {
        jointSize: '',
        jointWt: '',
        component1: '',
        component2: '',
        jointSequence: 1
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleCreateOrUpdate = (e) => {
        e.preventDefault();
        if (editingJoint) {
            updateAssemblyJoint(editingJoint.id, formData);
        } else {
            addAssemblyJoint(formData);
        }
        setShowCreate(false);
        setEditingJoint(null);
        setFormData(initialFormState);
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this Assembly Joint?")) {
            deleteAssemblyJoint(id);
        }
    };

    const openEdit = (joint) => {
        setEditingJoint(joint);
        setFormData({
            jointSize: joint.jointSize,
            jointWt: joint.jointWt,
            component1: joint.component1,
            component2: joint.component2,
            jointSequence: joint.jointSequence
        });
        setShowCreate(true);
    };

    const cancelEdit = () => {
        setShowCreate(false);
        setEditingJoint(null);
        setFormData(initialFormState);
    };

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2>Spool Assembly Joint Mapping</h2>
                    <p className="subtitle">Reference cladded components via their SAGE CODE to construct Finished Spools.</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="md-search" style={{ position: 'relative', width: '300px' }}>
                        <Search className="search-icon" size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="premium-input"
                            style={{ paddingLeft: '2.25rem' }}
                            placeholder="Search by Joint ID or Sage Code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {!showCreate && (
                        <button className="btn-primary" onClick={() => setShowCreate(true)}>
                            <Plus size={18} /> Plan New Joint
                        </button>
                    )}
                </div>
            </div>

            {!showCreate ? (
                <div className="glass-panel table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Joint ID</th>
                                <th>Component 1 (Sage Code)</th>
                                <th>Component 2 (Sage Code)</th>
                                <th>Size</th>
                                <th>Wall Thck</th>
                                <th>Sequence</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJoints.map(joint => (
                                <tr key={joint.id}>
                                    <td className="highlight-text">{joint.id}</td>
                                    <td>
                                        <div className="badge badge-info">
                                            {joint.component1}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="badge badge-info">
                                            {joint.component2}
                                        </div>
                                    </td>
                                    <td>{joint.jointSize}</td>
                                    <td>{joint.jointWt}</td>
                                    <td>Step {joint.jointSequence}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <button className="icon-btn-small" onClick={() => openEdit(joint)} title="Edit Joint" style={{ color: 'var(--text-secondary)' }}>
                                                <Edit size={16} />
                                            </button>
                                            <button className="icon-btn-small" onClick={() => handleDelete(joint.id)} title="Delete Joint" style={{ color: 'var(--danger)' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredJoints.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">No joints found matching your search.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="glass-panel create-form-panel animate-fade-in" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="form-header">
                        <h3>{editingJoint ? `Edit Assembly Joint: ${editingJoint.id}` : 'Assembly Spool Header'}</h3>
                        <button className="icon-btn-small" onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleCreateOrUpdate} className="so-form">
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div className="input-group">
                                <label className="input-label">Component 1 (Sage Code)</label>
                                <select
                                    className="premium-input select-input"
                                    value={formData.component1}
                                    onChange={(e) => setFormData({ ...formData, component1: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Cladded Component...</option>
                                    {availableComponents.map(c => (
                                        <option key={c.id} value={c.sageCode}>{c.sageCode} - {c.itemCategory} ({c.id})</option>
                                    ))}
                                    {/* Include current components even if they are no longer "available" for new ones, though in this simple logic they always are since they have Sage Codes */}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Component 2 (Sage Code)</label>
                                <select
                                    className="premium-input select-input"
                                    value={formData.component2}
                                    onChange={(e) => setFormData({ ...formData, component2: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Select Cladded Component...</option>
                                    {availableComponents.filter(c => c.sageCode !== formData.component1).map(c => (
                                        <option key={c.id} value={c.sageCode}>{c.sageCode} - {c.itemCategory} ({c.id})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Joint Size</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.jointSize} onChange={(e) => setFormData({ ...formData, jointSize: e.target.value })} required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Joint WT</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.jointWt} onChange={(e) => setFormData({ ...formData, jointWt: e.target.value })} required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Joint Sequence</label>
                                <input
                                    type="number" className="premium-input"
                                    value={formData.jointSequence} onChange={(e) => setFormData({ ...formData, jointSequence: Number(e.target.value) })} required min="1"
                                />
                            </div>
                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                            <button type="submit" className="btn-primary"><Save size={18} /> {editingJoint ? 'Update Joint Mapping' : 'Map Components to Joint'}</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AssemblyPage;
