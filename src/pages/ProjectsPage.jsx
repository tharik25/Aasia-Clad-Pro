import React, { useState } from 'react';
import { Plus, FolderKanban, CheckCircle2, ChevronRight, X, Search, Building2, Calendar, Edit, Trash2, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import POHeaderForm from '../components/POHeaderForm';
import './ProjectsPage.css';

const ProjectsPage = () => {
    const { projects, addProject, updateProject, deleteProject, projectCounter } = useStore();
    const [showCreate, setShowCreate] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const initialFormState = {
        projectType: 'Cladded Individual Items',
        name: '',
        date: new Date().toISOString().split('T')[0],
        plant: 'Plant-1',
        customer: 'PetroChem Global',
        endUser: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const CUSTOMER_LIST = ['PetroChem Global', 'Aramco', 'Shell', 'BP'];

    const handleCreateOrUpdate = (e) => {
        e.preventDefault();
        if (isEditing && selectedProject) {
            updateProject(selectedProject.id, formData);
            // After update, we need to refresh the selectedProject pointer so the master view updates
            setSelectedProject({ ...selectedProject, ...formData, clientName: `${formData.customer} / ${formData.endUser}` });
            setIsEditing(false);
        } else {
            addProject(formData);
            setShowCreate(false);
        }
        setFormData(initialFormState);
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
            projectType: selectedProject.projectType || 'Cladded Individual Items',
            name: selectedProject.name || '',
            date: selectedProject.date || new Date().toISOString().split('T')[0],
            plant: selectedProject.plant || 'Plant-1',
            customer: selectedProject.customer || 'PetroChem Global',
            endUser: selectedProject.endUser || ''
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData(initialFormState);
    };

    const currentAutoId = `AS-CL-${String(projectCounter).padStart(3, '0')}`;

    const filteredProjects = projects.filter(p =>
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // If a project is selected, show its POs and details in a unified One-Page Master View
    if (selectedProject) {
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
                                    <label className="input-label">Project Type</label>
                                    <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="radio" value="Cladded Individual Items" checked={formData.projectType === 'Cladded Individual Items'} onChange={(e) => setFormData({ ...formData, projectType: e.target.value })} /> Cladded Individual Items
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                            <input type="radio" value="Cladded Spools" checked={formData.projectType === 'Cladded Spools'} onChange={(e) => setFormData({ ...formData, projectType: e.target.value })} /> Cladded Spools
                                        </label>
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Project Name</label>
                                    <input type="text" className="premium-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
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
                                    <label className="input-label">Customer</label>
                                    <select className="premium-input select-input" value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required>
                                        {CUSTOMER_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">End User</label>
                                    <input type="text" className="premium-input" value={formData.endUser} onChange={(e) => setFormData({ ...formData, endUser: e.target.value })} required />
                                </div>
                                <div className="input-group">
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
                                    <h2 style={{ marginBottom: '0.25rem' }}>{selectedProject.name} <span className="project-id-badge" style={{ verticalAlign: 'middle', marginLeft: '0.5rem' }}>{selectedProject.id}</span></h2>
                                    <p className="subtitle">Client Name: <strong className="highlight-text">{selectedProject.clientName}</strong></p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
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
                        </div>
                    </div>
                )}

                {/* Render the PO Header Form / List for this specific Project */}
                {!isEditing && (
                    <div className="project-content-area">
                        <POHeaderForm projectId={selectedProject.id} />
                    </div>
                )}
            </div>
        );
    }

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
                    {filteredProjects.map(project => (
                        <div key={project.id} className="glass-panel project-card">
                            <div className="project-card-header">
                                <div className="project-icon">
                                    <FolderKanban size={24} color="var(--accent-primary)" />
                                </div>
                                <div className="project-id-badge">{project.id}</div>
                            </div>
                            <h3 className="project-name">{project.name}</h3>
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

                            <div className="project-actions" style={{ marginTop: '1.5rem' }}>
                                <button className="btn-primary flex-1" onClick={() => setSelectedProject(project)}>
                                    View Master Details <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

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
                                <label className="input-label">Project Type</label>
                                <div className="radio-group" style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            value="Cladded Individual Items"
                                            checked={formData.projectType === 'Cladded Individual Items'}
                                            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                        /> Cladded Individual Items
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            value="Cladded Spools"
                                            checked={formData.projectType === 'Cladded Spools'}
                                            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                                        /> Cladded Spools
                                    </label>
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Project Name</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
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
                                <label className="input-label">Customer</label>
                                <select
                                    className="premium-input select-input"
                                    value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} required
                                >
                                    {CUSTOMER_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">End User</label>
                                <input
                                    type="text" className="premium-input"
                                    value={formData.endUser} onChange={(e) => setFormData({ ...formData, endUser: e.target.value })} required
                                />
                            </div>

                            <div className="input-group">
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
