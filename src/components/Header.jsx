import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';
import './Header.css';

const Header = () => {
    return (
        <header className="top-header">
            <div className="search-container">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search orders, projects, or materials..."
                    className="header-search-input"
                />
            </div>
            <div className="header-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="badge-dot"></span>
                </button>
                <button className="icon-btn">
                    <Settings size={20} />
                </button>
            </div>
        </header>
    );
};

export default Header;
