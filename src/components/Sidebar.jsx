import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Briefcase,
    PackageSearch,
    Wrench,
    CheckCircle,
    Database,
    FileText
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
    const navItems = [
        { path: '/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/projects', name: 'Projects (Start Here)', icon: <Briefcase size={20} /> },
        { path: '/shop-floor', name: 'Cladding (Sage Codes)', icon: <Wrench size={20} /> },
        { path: '/assembly', name: 'Assembly Joints', icon: <PackageSearch size={20} /> },
        { path: '/quality', name: 'Job Instruction Sheets', icon: <CheckCircle size={20} /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <NavLink to="/dashboard" className="logo">
                    <div className="logo-icon">AC</div>
                    <span className="logo-text">Aasia Clad Pro</span>
                </NavLink>
            </div>

            <div className="sidebar-heading">MAIN MENU</div>
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/master-data" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Database size={20} />
                    <span>Master Data</span>
                </NavLink>
                <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Briefcase size={20} />
                    <span>Projects & POs</span>
                </NavLink>
            </nav>

            <div className="sidebar-heading" style={{ marginTop: '2rem' }}>ENGINEERING</div>
            <nav className="sidebar-nav">
                <NavLink to="/nmr" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FileText size={20} />
                    <span>NMR Documents</span>
                </NavLink>
            </nav>

            <div className="sidebar-heading" style={{ marginTop: '2rem' }}>SHOP FLOOR</div>
            <nav className="sidebar-nav">
                <NavLink to="/shop-floor" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Wrench size={20} />
                    <span>Cladding (Sage Codes)</span>
                </NavLink>
                <NavLink to="/assembly" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <PackageSearch size={20} />
                    <span>Assembly Joints</span>
                </NavLink>
                <NavLink to="/quality" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <CheckCircle size={20} />
                    <span>Job Instruction Sheets</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="avatar">AD</div>
                    <div className="user-info">
                        <span className="user-name">Admin User</span>
                        <span className="user-role">Plant Manager</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
