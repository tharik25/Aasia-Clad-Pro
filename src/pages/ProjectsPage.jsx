import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, FolderKanban, CheckCircle2, ChevronRight, X, Search, Building2, Calendar,
    Edit, Trash2, Save, Tag, AlertCircle, ArrowRight
} from 'lucide-react';
import { useStore } from '../store/useStore';
import POHeaderForm from '../components/POHeaderForm';
import './ProjectsPage.css';

const PROJECT_TYPE_OPTIONS = [
    'Cladded Pipe',
    'Cladded Fittings',
    'Cladded Flanges',
    'Cladded Pipe / Cladded Fittings',
];

// ── Tag Input Component ───────────────────────────────────────────────────────
const TagInput = ({ tags = [], onChange, placeholder = 'Type and press Enter...' }) => {
    const [inputVal, setInputVal] = useState('');

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && inputVal.trim()) {
            e.preventDefault();
            const newTag = inputVal.trim().replace(/,$/, '');
            if (newTag && !tags.includes(newTag)) {
                onChange([...tags, newTag]);
            }
            setInputVal('');
        } else if (e.key === 'Backspace' && !inputVal && tags.length > 0) {
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (idx) => onChange(tags.filter((_, i) => i !== idx));

    return (
        <div
            className="premium-input"
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                minHeight: '2.6rem',
                padding: '0.4rem 0.75rem',
                cursor: 'text',
                height: 'auto',
            }}
            onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
        >
            {tags.map((tag, i) => (
                <span
                    key={i}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        background: 'rgba(99,102,241,0.18)',
                        color: 'var(--accent-primary)',
                        borderRadius: '999px',
                        padding: '0.15rem 0.7rem',
                        fontSize: '0.82rem',
                        fontWeight: 500,
                        border: '1px solid rgba(99,102,241,0.3)',
                    }}
                >
                    <Tag size={11} />
                    {tag}
                    <span
                        onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                        style={{ cursor: 'pointer', lineHeight: 1, marginLeft: '0.1rem', opacity: 0.7 }}
                    >×</span>
                </span>
            ))}
            <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? placeholder : ''}
                style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    flex: '1 0 120px',
                    minWidth: '80px',
                    fontSize: '0.9rem',
                    padding: '0.1rem 0',
                }}
            />
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────

const ProjectsPage = () => {
    const {
        projects, addProject, updateProject, deleteProject, projectCounter,
        customers, purchaseOrders, poLineItems, nmrDocuments,
        selectedProjectId, setSelectedProjectId
    } = useStore();
    const navigate = useNavigate();
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    // Handle deep-linking from store
    React.useEffect(() => {
        if (selectedProjectId) {
            const proj = projects.find(p => p.id === selectedProjectId);
            if (proj) setSelectedProject(proj);
            setSelectedProjectId(null); // Clear after use
        }
    }, [selectedProjectId, projects, setSelectedProjectId]);

    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        projectType: 'Cladded Pipe',
        name: [],            // array of tags
        date: new Date().toISOString().split('T')[0],
        plant: 'Plant-1',
        customer: customers.length > 0 ? customers[0].name : '',
        endUser: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleCreateOrUpdate = (e) => {
        e.preventDefault();
        if (isEditing && selectedProject) {
            updateProject(selectedProject.id, formData);
            setSelectedProject({
                ...selectedProject,
                ...formData,
                clientName: `${formData.customer} / ${formData.endUser}`
            });
            setIsEditing(false);
        } else {
            addProject(formData);
            setShowCreate(false);
        }
        setFormData({
            ...initialFormState,
            customer: customers.length > 0 ? customers[0].name : ''
        });
    };

    const handleDeleteProject = () => {
        if (!selectedProject) return;
        if (window.confirm(`Are you sure you want to delete Project ${selectedProject.id}? This will absolutely delete all associated POs and Line Items as well.`)) {
            deleteProject(selectedProject.id);
            setSelectedProject(null);
            setIsEditing(false);
        }
    };

    const openEditMode = () => {
        setFormData({
            projectType: selectedProject.projectType || 'Cladded Pipe',
            name: Array.isArray(selectedProject.name) ? selectedProject.name : (selectedProject.name ? [selectedProject.name] : []),
            date: selectedProject.date || new Date().toISOString().split('T')[0],
            plant: selectedProject.plant || 'Plant-1',
            customer: selectedProject.customer || (customers.length > 0 ? customers[0].name : ''),
            endUser: selectedProject.endUser || ''
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData(initialFormState);
    };

    const currentAutoId = `AS-CL-${String(projectCounter).padStart(3, '0')}`;

    const filteredProjects = projects.filter(p => {
        const nameStr = Array.isArray(p.name) ? p.name.join(' ') : (p.name || '');
        return (
            p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.customer || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // ── Project Detail View ───────────────────────────────────────────────────
    if (selectedProject) {
        const nameDisplay = Array.isArray(selectedProject.name)
            ? selectedProject.name.join(', ')
            : selectedProject.name || '';

        return (
            <div className="page-container animate-fade-in">
                <div className="breadcrumb" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span className="text-muted cursor-pointer hover-underline" onClick={() => { setSelectedProject(null); setIsEditing(false); }}>Projects</span>
                        <ChevronRight size={16} className="text-muted mx-2" />
                        <span className="highlight-text">{selectedProject.id}</span>
                    </div>
                    {!isEditing && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={openEditMode}>
                                <Edit size={16} /> Edit Project Header
                            </button>
                            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDeleteProject}>
                                <Trash2 size={16} /> Delete Project
                            </button>
                        </div>
                    )}
                </div>

                {isEditing ? (
                    <div className="glass-panel create-form-panel animate-fade-in" style={{ marginBottom: '2rem', borderLeft: '4px solid var(--accent-primary)' }}>
                        <div className="form-header">
                            <h3>Edit Project Header: {selectedProject.id}</h3>
                            <button className="icon-btn-small" onClick={cancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateOrUpdate} className="so-form">
                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="input-group">
                                    <label className="input-label">Project Number</label>
                                    <input type="text" className="premium-input text-muted" value={selectedProject.id} disabled />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Project Type (Cladded Material)</label>
                                    <select
                                        className="premium-input select-input"
                                        value={formData.projectType}
                                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                        required
                                    >
                                        {PROJECT_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Project Name <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(press Enter to add tags)</span></label>
                                    <TagInput
                                        tags={formData.name}
                                        onChange={(tags) => setFormData({ ...formData, name: tags })}
                                        placeholder="Type a tag and press Enter..."
                                    />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Project Date</label>
                                    <input type="date" className="premium-input" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Plant</label>
                                    <select className="premium-input select-input" value={formData.plant} onChange={(e) => setFormData({ ...formData, plant: e.target.value })} required>
                                        <option value="Plant-1">Plant-1</option>
                                        <option value="Plant-2">Plant-2</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Customer Name</label>
                                    <select className="premium-input select-input" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required>
                                        {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">End User</label>
                                    <input type="text" className="premium-input" value={formData.endUser} onChange={(e) => setFormData({ ...formData, endUser: e.target.value })} required />
                                </div>
                                <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="input-label">Client Name (Auto Calc)</label>
                                    <input type="text" className="premium-input" style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }} value={`${formData.customer} / ${formData.endUser}`} disabled />
                                </div>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                                <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                                <button type="submit" className="btn-primary"><Save size={18} /> Update Project</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <div className="project-icon" style={{ width: '56px', height: '56px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    AC
                                </div>
                                <div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '0.3rem' }}>
                                        {Array.isArray(selectedProject.name)
                                            ? selectedProject.name.map((tag, i) => (
                                                <span key={i} style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                                                    background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)',
                                                    borderRadius: '999px', padding: '0.15rem 0.65rem',
                                                    fontSize: '0.9rem', fontWeight: 600,
                                                    border: '1px solid rgba(99,102,241,0.25)',
                                                }}>
                                                    <Tag size={12} />{tag}
                                                </span>
                                            ))
                                            : <span style={{ fontWeight: 600 }}>{selectedProject.name}</span>
                                        }
                                        <span className="project-id-badge" style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}>{selectedProject.id}</span>
                                    </div>
                                    <p className="subtitle">Client Name: <strong className="highlight-text">{selectedProject.clientName}</strong></p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                                <div className="detail-row"
                                    style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer' }}
                                    onClick={() => navigate('/master-data')}
                                >
                                    <Building2 size={16} color="var(--accent-primary)" />
                                    <span className="text-muted">Client:</span>
                                    <span style={{ fontWeight: 600, color: 'var(--accent-primary)', textDecoration: 'underline' }}>{selectedProject.clientName}</span>
                                </div>
                                <div className="detail-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <FolderKanban size={16} className="text-muted" />
                                    <span className="text-muted">Type:</span>
                                    <span className="highlight-text">{selectedProject.projectType}</span>
                                </div>
                                <div className="detail-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Building2 size={16} className="text-muted" />
                                    <span className="text-muted">Plant:</span>
                                    <span className="highlight-text">{selectedProject.plant}</span>
                                </div>
                                <div className="detail-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <Calendar size={16} className="text-muted" />
                                    <span className="text-muted">Date:</span>
                                    <span className="highlight-text">{selectedProject.date}</span>
                                </div>
                            </div>

                            {/* ── Pending NMRs Section ───────────────────────────── */}
                            {(() => {
                                const pendingNmrs = nmrDocuments.filter(n => n.projectId === selectedProject.id && !['APPROVED', 'CODE-4', 'CODE-D'].includes(n.status));
                                if (pendingNmrs.length === 0) return null;
                                return (
                                    <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem', borderLeft: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                            <AlertCircle size={18} color="#f59e0b" />
                                            <h4 style={{ margin: 0, fontSize: '0.95rem' }}>Pending NMRs ({pendingNmrs.length})</h4>
                                        </div>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            <table className="data-table" style={{ fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr>
                                                        <th>NMR No</th>
                                                        <th>Rev</th>
                                                        <th>Status</th>
                                                        <th style={{ textAlign: 'right' }}>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingNmrs.map(n => (
                                                        <tr key={n.id}>
                                                            <td style={{ fontWeight: 600 }}>{n.nmrNumber}</td>
                                                            <td>{n.revision}</td>
                                                            <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>{n.status}</span></td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button onClick={() => navigate('/nmr')} className="icon-btn-small" style={{ color: 'var(--accent-primary)' }}>
                                                                    <ArrowRight size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {!isEditing && (
                    <div className="project-content-area">
                        <POHeaderForm projectId={selectedProject.id} />
                    </div>
                )}
            </div>
        );
    }

    // ── Project List View ─────────────────────────────────────────────────────
    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h2>Project Portfolio</h2>
                    <p className="subtitle">Master list of all Engineer-to-Order projects.</p>
                </div>
                <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="md-search" style={{ position: 'relative', width: '300px' }}>
                        <Search className="search-icon" size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="premium-input"
                            style={{ paddingLeft: '2.25rem' }}
                            placeholder="Search by ID, Name, or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {!showCreate && (
                        <button className="btn-primary" onClick={() => setShowCreate(true)}>
                            <Plus size={18} /> New Project
                        </button>
                    )}
                </div>
            </div>

            {!showCreate ? (
                <div className="projects-grid">
                    {filteredProjects.map(project => {
                        const nameStr = Array.isArray(project.name) ? project.name.join(', ') : (project.name || '');

                        // ── Rollup stats across all POs for this project ──────
                        const projectPOIds = purchaseOrders
                            .filter(po => po.projectId === project.id)
                            .map(po => po.id);
                        const projectLineItems = poLineItems.filter(li => projectPOIds.includes(li.poId));

                        const totalQty = projectLineItems.reduce((sum, li) => sum + (Number(li.quantity) || 0), 0);

                        const allDates = projectLineItems
                            .map(li => li.deliveryDate)
                            .filter(Boolean)
                            .sort();
                        const maxDate = allDates.length > 0 ? allDates[allDates.length - 1] : null;

                        const totalBaseSAR = projectLineItems.reduce((sum, li) => {
                            // Use stored basePriceSAR if available; otherwise fall back to grandTotal or netTotal × rate
                            const RATES = { USD: 3.75, SAR: 1, EUR: 4.05, GBP: 4.73 };
                            if (li.basePriceSAR && !isNaN(Number(li.basePriceSAR))) return sum + Number(li.basePriceSAR);
                            const priceSource = li.grandTotal || li.netTotal || li.totalPrice || '';
                            const rate = RATES[li.currency || 'USD'] || 1;
                            return sum + (priceSource !== '' ? Number(priceSource) * rate : 0);
                        }, 0);
                        // ─────────────────────────────────────────────────────

                        return (
                            <div key={project.id} className="glass-panel project-card">
                                <div className="project-card-header">
                                    <div className="project-icon">
                                        <FolderKanban size={24} color="var(--accent-primary)" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <button
                                            className="icon-btn-small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm('Delete this project and all associated data?')) deleteProject(project.id);
                                            }}
                                            style={{ color: 'var(--danger)', opacity: 0.6 }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="project-id-badge">{project.id}</div>
                                    </div>
                                </div>

                                {/* Name tags */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                                    {Array.isArray(project.name) && project.name.length > 0
                                        ? project.name.map((tag, i) => (
                                            <span key={i} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                                background: 'rgba(99,102,241,0.12)', color: 'var(--accent-primary)',
                                                borderRadius: '999px', padding: '0.1rem 0.55rem',
                                                fontSize: '0.78rem', fontWeight: 500,
                                                border: '1px solid rgba(99,102,241,0.2)',
                                            }}>
                                                <Tag size={10} />{tag}
                                            </span>
                                        ))
                                        : <h3 className="project-name">{nameStr}</h3>
                                    }
                                </div>

                                <p className="project-so">Type: <strong style={{ color: 'var(--accent-primary)' }}>{project.projectType}</strong></p>

                                <div className="project-details">
                                    <div className="detail-row">
                                        <span>Client:</span>
                                        <span className="highlight-text">{project.clientName}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Plant:</span>
                                        <span>{project.plant}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Date:</span>
                                        <span>{project.date}</span>
                                    </div>
                                </div>

                                {/* ── Line Item Rollup Stats ─────────────────── */}
                                {projectLineItems.length > 0 && (
                                    <div style={{
                                        marginTop: '1rem',
                                        paddingTop: '0.85rem',
                                        borderTop: '1px solid var(--glass-border)',
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr 1fr',
                                        gap: '0.5rem',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Qty</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{totalQty.toLocaleString()}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Delivery</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{maxDate || '—'}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Base (SAR)</span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-secondary, #34d399)' }}>
                                                {totalBaseSAR > 0 ? totalBaseSAR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="project-actions" style={{ marginTop: '1.5rem' }}>
                                    <button className="btn-primary flex-1" onClick={() => setSelectedProject(project)}>
                                        View Master Details <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {filteredProjects.length === 0 && (
                        <div className="empty-state glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <FolderKanban size={48} className="text-muted" style={{ margin: '0 auto 1rem' }} />
                            <p>No projects match your search criteria.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="glass-panel create-form-panel animate-fade-in" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                    <div className="form-header">
                        <h3>Initiate New Project Header</h3>
                        <button className="icon-btn-small" onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                    </div>
                    <form onSubmit={handleCreateOrUpdate} className="so-form">
                        <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

                            <div className="input-group">
                                <label className="input-label">Project Number (Auto-Generated)</label>
                                <input type="text" className="premium-input text-muted" value={currentAutoId} disabled />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Project Type (Cladded Material)</label>
                                <select
                                    className="premium-input select-input"
                                    value={formData.projectType}
                                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                    required
                                >
                                    {PROJECT_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>

                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Project Name <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(press Enter to add tags)</span></label>
                                <TagInput
                                    tags={formData.name}
                                    onChange={(tags) => setFormData({ ...formData, name: tags })}
                                    placeholder="Type a tag and press Enter..."
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Project Date</label>
                                <input
                                    type="date" className="premium-input"
                                    value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Plant</label>
                                <select
                                    className="premium-input select-input"
                                    value={formData.plant} onChange={(e) => setFormData({ ...formData, plant: e.target.value })} required
                                >
                                    <option value="Plant-1">Plant-1</option>
                                    <option value="Plant-2">Plant-2</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Customer Name</label>
                                <select
                                    className="premium-input select-input"
                                    value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required
                                >
                                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">End User</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.endUser} onChange={(e) => setFormData({ ...formData, endUser: e.target.value })} required
                                />
                            </div>

                            <div className="input-group" style={{ gridColumn: 'span 2' }}>
                                <label className="input-label">Client Name (Auto Calc)</label>
                                <input
                                    type="text" className="premium-input"
                                    style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-primary)' }}
                                    value={`${formData.customer} / ${formData.endUser}`} disabled
                                />
                            </div>

                        </div>

                        <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button type="submit" className="btn-primary"><CheckCircle2 size={18} /> Create Project</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
