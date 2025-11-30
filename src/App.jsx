import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import UserCreatePage from './pages/admin/UserCreatePage';
import UsersListPage from './pages/admin/UsersListPage';
import UserViewPage from './pages/admin/UserViewPage';
import UserEditPage from './pages/admin/UserEditPage';
import RoleCreatePage from './pages/admin/RoleCreatePage';
import RolesListPage from './pages/admin/RolesListPage';
import RoleViewPage from './pages/admin/RoleViewPage';
import RoleEditPage from './pages/admin/RoleEditPage';
import ModuleCreatePage from './pages/admin/ModuleCreatePage';
import ModulesListPage from './pages/admin/ModulesListPage';
import ModuleViewPage from './pages/admin/ModuleViewPage';
import ModuleEditPage from './pages/admin/ModuleEditPage';
import FeatureCreatePage from './pages/admin/FeatureCreatePage';
import FeaturesListPage from './pages/admin/FeaturesListPage';
import FeatureViewPage from './pages/admin/FeatureViewPage';
import FeatureEditPage from './pages/admin/FeatureEditPage';
import PermissionListPage from './pages/admin/PermissionListPage';
import PermissionCreatePage from './pages/admin/PermissionCreatePage';

import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectFormPage from "./pages/projects/ProjectFormPage";

import { Tooltip, Popover } from 'bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  
  useEffect(() => {
	  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	  tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new Tooltip(tooltipTriggerEl);
	  });
	}, []);

  return (
    <Router>
      <Navbar user={user}  setUser={setUser} />
      <div className="d-flex">
        {user && <Sidebar />}
        <div className="flex-grow-1 p-3">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/dashboard" element={user ? <Dashboard /> : <Login setUser={setUser} />} />
			<Route path="/module/:moduleName" element={user ? <ModulePage user={user} /> : <Login setUser={setUser} />} />
			
			
			
						{/* User pages */}
			<Route path="/admin/users/create" element={<UserCreatePage />} />			
			<Route path="/admin/users" element={<UsersListPage />} />
			<Route path="/admin/users/view/:id" element={<UserViewPage />} />
			<Route path="/admin/users/edit/:id" element={<UserEditPage />} />
			
			{/* Role pages */}
			<Route path="/admin/roles/create" element={<RoleCreatePage />} />	
			<Route path="/admin/roles" element={<RolesListPage />} />
			<Route path="/admin/roles/view/:id" element={<RoleViewPage />} />
			<Route path="/admin/roles/edit/:id" element={<RoleEditPage />} />
			
			{/* Module pages */}
			<Route path="/admin/modules/create" element={<ModuleCreatePage />} />
			<Route path="/admin/modules" element={<ModulesListPage />} />
			<Route path="/admin/modules/view/:id" element={<ModuleViewPage />} />
			<Route path="/admin/modules/edit/:id" element={<ModuleEditPage />} />
			
			
			{/* Features pages */}
			<Route path="/admin/features/create" element={<FeatureCreatePage />} />
			<Route path="/admin/features" element={<FeaturesListPage />} />
			<Route path="/admin/features/view/:id" element={<FeatureViewPage />} />
			<Route path="/admin/features/edit/:id" element={<FeatureEditPage />} />
			
			{/* Projects pages will be given here*/}
			<Route path="/projects/list" element={<ProjectsPage />} />
			<Route path="/projects/create" element={<ProjectFormPage />} />
			<Route path="/projects/edit/:id" element={<ProjectFormPage />} />
			
			{/* PermissionList pages */}
			<Route path="/admin/permissions" element={<PermissionListPage />} />
			<Route path="/admin/permissions/create" element={<PermissionCreatePage />} />
			<Route path="*" element={<div style={{color:'red'}}>NO MATCH</div>} />
			
			
			
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
