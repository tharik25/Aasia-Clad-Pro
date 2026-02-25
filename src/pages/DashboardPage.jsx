import React from 'react';
import { Briefcase, Wrench, PackageSearch, CheckCircle, Package, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import './DashboardPage.css';

const DashboardPage = () => {
    const { projects, purchaseOrders, spools, assemblyJoints, jisOperations } = useStore();

    // Calculate metrics
    const activeProjectsCount = projects.length;
    const pendingCladdingCount = spools.filter(s => s.status === 'Pending Cladding').length;
    const completedCladdingCount = spools.filter(s => s.sageCode).length;
    const assemblyJointsCount = assemblyJoints.length;

    // Get recent activities (completed operations)
    const recentActivities = jisOperations
        .filter(op => op.status === 'Completed' || op.status === 'Active')
        .sort((a, b) => new Date(b.finishDate || b.startDate) - new Date(a.finishDate || a.startDate))
        .slice(0, 5);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header animate-fade-in">
                <div>
                    <h2>Overview</h2>
                    <p className="subtitle">Welcome back! Here's the live ETO production status.</p>
                </div>
                <button className="btn-primary">Generate Report</button>
            </div>

            <div className="stats-grid">
                <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)' }}>
                        <Briefcase size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{activeProjectsCount}</span>
                        <span className="stat-label">Active Projects</span>
                    </div>
                </div>
                <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
                        <Wrench size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{pendingCladdingCount}</span>
                        <span className="stat-label">Pending Cladding</span>
                    </div>
                </div>
                <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)' }}>
                        <Package size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{completedCladdingCount}</span>
                        <span className="stat-label">Cladded (Sage Codes)</span>
                    </div>
                </div>
                <div className="stat-card glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-secondary)' }}>
                        <PackageSearch size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{assemblyJointsCount}</span>
                        <span className="stat-label">Assembly Joints Planned</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <div className="glass-panel main-chart">
                    <h3>Production Output (Weekly)</h3>
                    <div className="chart-placeholder">
                        <div className="bar-wrapper">
                            <div className="bar" style={{ height: '60%' }}></div>
                            <span>Mon</span>
                        </div>
                        <div className="bar-wrapper">
                            <div className="bar" style={{ height: '80%', background: 'var(--success)' }}></div>
                            <span>Tue</span>
                        </div>
                        <div className="bar-wrapper">
                            <div className="bar" style={{ height: '40%' }}></div>
                            <span>Wed</span>
                        </div>
                        <div className="bar-wrapper">
                            <div className="bar" style={{ height: '90%', background: 'var(--accent-gradient)' }}></div>
                            <span>Thu</span>
                        </div>
                        <div className="bar-wrapper">
                            <div className="bar" style={{ height: '70%' }}></div>
                            <span>Fri</span>
                        </div>
                    </div>
                </div>

                <div className="glass-panel recent-activity">
                    <h3>Recent Operations</h3>
                    <ul className="activity-list">
                        {recentActivities.map((op, idx) => (
                            <li key={idx}>
                                <div className={`activity-indicator ${op.status === 'Completed' ? 'success' : 'info'}`}></div>
                                <div className="activity-content">
                                    <p><strong>{op.processName}</strong> {op.status === 'Completed' ? 'passed inspection' : 'in progress'} by {op.inspectorId || 'Unknown'}</p>
                                    <span>{new Date(op.finishDate || op.startDate).toLocaleTimeString()} - {op.description}</span>
                                </div>
                            </li>
                        ))}
                        {recentActivities.length === 0 && (
                            <li>
                                <div className="activity-content">
                                    <p className="text-muted">No recent operations logged yet.</p>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
