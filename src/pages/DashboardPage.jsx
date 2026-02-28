import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Wrench, PackageSearch, CheckCircle, Package, TrendingUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import './DashboardPage.css';

const DashboardPage = () => {
    const {
        projects,
        purchaseOrders,
        poLineItems,
        spools,
        assemblyJoints,
        jisOperations,
        nmrDocuments,
        customers,
        vendors,
        products,
        workstations
    } = useStore();

    const navigate = useNavigate();
    const [activeSection, setActiveSection] = React.useState(null);

    const sections = [
        { key: 'projects', label: 'Projects', count: projects.length, icon: Briefcase, route: '/projects' },
        { key: 'purchaseOrders', label: 'Purchase Orders', count: purchaseOrders.length, icon: Package, route: '/purchase-orders' },
        { key: 'spools', label: 'Spools', count: spools.length, icon: Wrench, route: '/inventory' },
        { key: 'assemblyJoints', label: 'Assemblies', count: assemblyJoints.length, icon: PackageSearch, route: '/assembly' },
        { key: 'jisOperations', label: 'Operations', count: jisOperations.length, icon: CheckCircle, route: '/operations' },
        { key: 'nmrDocuments', label: 'NMR Docs', count: nmrDocuments.length, icon: TrendingUp, route: '/nmr' },
        { key: 'customers', label: 'Customers', count: customers.length, icon: Briefcase, route: '/master-data' },
        { key: 'vendors', label: 'Vendors', count: vendors.length, icon: Briefcase, route: '/master-data' },
        { key: 'products', label: 'Products', count: products.length, icon: Package, route: '/master-data' },
        { key: 'workstations', label: 'Workstations', count: workstations.length, icon: Wrench, route: '/master-data' }
    ];

    const getSectionItems = (key) => {
        switch (key) {
            case 'projects': return projects.slice(-5).map(p => ({ id: p.id, name: p.name || p.clientName }));
            case 'purchaseOrders': return purchaseOrders.slice(-5).map(po => ({ id: po.id, name: po.id }));
            case 'spools': return spools.slice(-5).map(s => ({ id: s.id, name: s.description }));
            case 'assemblyJoints': return assemblyJoints.slice(-5).map(a => ({ id: a.id, name: a.component1 }));
            case 'jisOperations': return jisOperations.slice(-5).map(j => ({ id: j.id, name: j.processName }));
            case 'nmrDocuments': return nmrDocuments.slice(-5).map(n => ({ id: n.id, name: n.drawingNumber }));
            case 'customers': return customers.slice(-5).map(c => ({ id: c.id, name: c.name }));
            case 'vendors': return vendors.slice(-5).map(v => ({ id: v.id, name: v.name }));
            case 'products': return products.slice(-5).map(p => ({ id: p.id, name: p.name }));
            case 'workstations': return workstations.slice(-5).map(w => ({ id: w.id, name: w.name }));
            default: return [];
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header animate-fade-in">
                <div>
                    <h2>Dashboard</h2>
                    <p className="subtitle">Interactive insights across the application</p>
                </div>
            </header>

            <div className="insights-grid">
                {sections.map((sec, idx) => {
                    const Icon = sec.icon;
                    return (
                        <div
                            key={sec.key}
                            className="insight-card glass-panel"
                            onClick={() => setActiveSection(sec.key)}
                            style={{ animationDelay: `${0.05 * idx}s` }}
                        >
                            <div className="insight-icon">
                                <Icon size={28} />
                            </div>
                            <div className="insight-info">
                                <span className="insight-value">{sec.count}</span>
                                <span className="insight-label">{sec.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {activeSection && (
                <section className="section-details glass-panel animate-fade-in">
                    <h3>Latest {sections.find(s => s.key === activeSection)?.label}</h3>
                    <ul>
                        {getSectionItems(activeSection).map(item => (
                            <li key={item.id}>{item.name || item.id}</li>
                        ))}
                    </ul>
                    <button
                        className="btn-link"
                        onClick={() => navigate(sections.find(s => s.key === activeSection)?.route)}
                    >
                        View all {sections.find(s => s.key === activeSection)?.label.toLowerCase()}
                    </button>
                </section>
            )}
        </div>
    );
};
export default DashboardPage;
