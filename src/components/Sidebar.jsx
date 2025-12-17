// components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUserShield, FaFolderOpen, FaDollarSign, FaUsers } from 'react-icons/fa';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const moduleIcons = {
	Dashboard: <FaTachometerAlt />,
	Admin: <FaUserShield />,
	Projects: <FaFolderOpen />,
	Finance: <FaDollarSign />,
	Customers: <FaUsers />
};

const moduleRouteMap = {
  Dashboard: '/dashboard',
	Admin: '/module/admin',
	Projects: '/projects/list',
	Finance: '/finance/list',
	Customers: '/customers/list'
};

export default function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const permissions = user?.permission || []; // fixed access
  //console.log("Sidebar Data Received: "+JSON.stringify(user));
  //console.log("Sidebar permissions: "+JSON.stringify(permissions));
  
  //const isActive = (route) => location.pathname.startsWith(route);
  //console.log("Sidebar isActive: "+isActive);
  
  if (!permissions.length) {
    return null;
  }
  
  return (
    <div style={{ width: '70px', backgroundColor: 'hsl(270, 70%, 40%)', color: 'white', minHeight: '100vh', padding: '0.5rem' }}>
      {permissions.map((module) => (
			//const route = moduleRouteMap[module.moduleName] || `/${module.moduleName.toLowerCase()}/list`;
          <div key={module.moduleId} className="mb-3 text-center">
			  <OverlayTrigger
				placement="right"
				overlay={<Tooltip id={`tooltip-${module.moduleName}`}>{module.moduleName}</Tooltip>}
				>
			  
				  <Link
					  to={
						moduleRouteMap[module.moduleName] || // keep Admin unchanged
						`/${module.moduleName.toLowerCase()}/list` // dynamic route for new modules
					  }
					  className={`sidebar-link d-flex flex-column align-items-center text-white text-decoration-none p-2 rounded`}
					>
					  <span className="icon">{moduleIcons[module.moduleName] || '📁'}</span>
						  {/*<span className="text mt-1 small" style={{fontSize: '0.6rem'}}>{module.moduleName}</span> */}
					</Link>
			  </OverlayTrigger>	
          </div>
        ))}
    </div>
  );  
}
