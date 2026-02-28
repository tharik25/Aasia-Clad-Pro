import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import SalesOrdersPage from './pages/SalesOrdersPage';
import ProjectsPage from './pages/ProjectsPage';
import AssemblyPage from './pages/AssemblyPage';
import ShopFloorPage from './pages/ShopFloorPage';
import QualityPage from './pages/QualityPage';
import MasterDataPage from './pages/MasterDataPage';
import NMRPage from './pages/NMRPage';
import MTOPage from './pages/MTOPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="master-data" element={<MasterDataPage />} />
          <Route path="sales-orders" element={<SalesOrdersPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="assembly" element={<AssemblyPage />} />
          <Route path="shop-floor" element={<ShopFloorPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="nmr" element={<NMRPage />} />
          <Route path="mto" element={<MTOPage />} />
          <Route path="*" element={
            <div className="page-wrapper animate-fade-in">
              <h1>404 - Page Not Found</h1>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
