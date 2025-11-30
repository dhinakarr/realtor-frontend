// components/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserShield, FaCogs, FaTh, FaUsers, FaKey, FaFolderOpen } from 'react-icons/fa';

const moduleIcons = {
  Admin: <FaUserShield />,
  Features: <FaCogs />,
  Modules: <FaTh />,
  Roles: <FaKey />,
  Users: <FaUsers />,
  Projects: <FaFolderOpen />, 
};

const moduleRouteMap = {
  Admin: "/module/Admin",
};

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const permissions = user?.permission || []; // fixed access
  //console.log("Sidebar Data Received: "+JSON.stringify(user));
  //console.log("Sidebar permissions: "+JSON.stringify(permissions));
  return (
    <div style={{ width: '70px', backgroundColor: 'hsl(270, 70%, 40%)', color: 'white', minHeight: '100vh', padding: '1rem' }}>
      {permissions.length > 0 ? (
        permissions.map((module) => (
          <div key={module.moduleId} className="mb-3">
		  
		  <Link
              to={
                moduleRouteMap[module.moduleName] || // keep Admin unchanged
                `/${module.moduleName.toLowerCase()}/list` // dynamic route for new modules
              }
              className="sidebar-link d-flex flex-column align-items-center"
            >
              <span className="icon">{moduleIcons[module.moduleName] || '📁'}</span>
              <span className="text">{module.moduleName}</span>
            </Link>
		  
		 {/*
            <Link
			  to={`/module/${module.moduleName}`}
			  className="sidebar-link d-flex flex-column align-items-center"
			>
              <span className="icon">{moduleIcons[module.moduleName] || '📁'}</span>
              <span className="text">{module.moduleName}</span>
            </Link>
		*/}
			
          </div>
        ))
      ) : (
        <p>No modules available</p>
      )}
    </div>
  );
}
