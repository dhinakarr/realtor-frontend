// pages/ModulePage.jsx
import React, { useEffect }  from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ModulePage({ user }) {
  const { moduleName } = useParams();
  const navigate = useNavigate();
//console.log("Module Page user: "+JSON.stringify(user));

  const module = user?.permission?.find(
	  (m) => m.moduleName.toLowerCase() === moduleName.toLowerCase()
	);
	
  const mapApiToRoute = (apiUrl) => {
	  //console.log("Module Page apiUrl: "+apiUrl);
	  if (apiUrl.includes("api/users")) return "/admin/users";				
	  if (apiUrl.includes("api/roles")) return "/admin/roles";
	  if (apiUrl.includes("api/modules")) return "/admin/modules";
	  if (apiUrl.includes("api/features")) return "/admin/features";
	  if (apiUrl.includes("api/permissions")) return "/admin/permissions";
	  return "/";
	};
	
  useEffect(() => {
    if (module && module.features.length > 0) {
      const visibleFeatures = [...module.features].reverse(); // same as UI order
      const firstFeature = visibleFeatures[0];  // now Users comes first
      navigate(mapApiToRoute(firstFeature.url));
    }
  }, [module]);
  
    
//console.log("Module Page module: "+module);
  if (!module) return <p>Module not found</p>;

  return (

    <div className="d-flex align-items-center flex-wrap p-3">
	  {/* Module Name */}
	  <div className="me-4">
		<h3 className="m-0">{module.moduleName}</h3>
	  </div>

	  {/* Feature Buttons */}
	  <div className="d-flex flex-wrap gap-2 ms-auto">
		{[...module.features].reverse().map((f) => (
		  <button
			key={f.featureId}
			className="btn btn-outline-primary"
			style={{ minWidth: "100px" }}
			onClick={() => navigate(mapApiToRoute(module.features[0].url))}
		  >
			{f.featureName}
		  </button>
		))}
	  </div>
	</div>
  );
}
