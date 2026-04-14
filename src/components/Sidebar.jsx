// components/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUserShield, FaFolderOpen, FaDollarSign, FaUsers, FaMapMarkedAlt,    // for Site Visit
  FaProjectDiagram, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const moduleIcons = {
	Dashboard: <FaTachometerAlt />,
	Admin: <FaUserShield />,
	Projects: <FaProjectDiagram />,
	Finance: <FaDollarSign />,
	Customers: <FaUsers />,
	"Site-Visits": <FaMapMarkerAlt />
};

const moduleRouteMap = {
  dashboard: '/dashboard',
	admin: '/module/admin',
	projects: '/projects/list',
	finance: '/finance/list',
	customers: '/customers/list',
	sitevisits: '/site-visits/list'
};

export default function Sidebar({user}) {
  const location = useLocation();
  const permissions = user?.permission || []; // fixed access
  const hiddenModules = ['Sales'];
  
  if (!permissions.length) {
    return null;
  }
  
  const normalize = (name) => name?.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  return (
    <div style={{width: '60px', minWidth: '60px', maxWidth: '60px', flex: '0 0 60px',
		backgroundColor: '#001F3F', color: 'white', minHeight: '100vh', padding: '0.5rem',
		display: 'flex', flexDirection: 'column', alignItems: 'center',}}
	>
	  {permissions.filter(module => !hiddenModules.includes(module.moduleName))
		.map((module) => {
			const key = normalize(module.moduleName);
			const route = moduleRouteMap[key];
		return (
		<OverlayTrigger
		  key={module.moduleId}
		  placement="right"
		  overlay={<Tooltip id={`tooltip-${module.moduleName}`}>{module.moduleName}</Tooltip>}
		>
		  <Link to={route || '#'}
			className="sidebar-link d-flex flex-column align-items-center justify-content-center text-white text-decoration-none rounded mb-3"
			style={{width: '100%', height: '50px', minWidth: '0', boxSizing: 'border-box',}}
		  >
			<span className="icon" style={{width: '100%', textAlign: 'center', display: 'inline-block',}}
			>
			  {moduleIcons[module.moduleName] || '📁'}
			</span>
		  </Link>
		</OverlayTrigger>
	  );
		})}
	</div>

  );  
}