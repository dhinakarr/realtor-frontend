import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { mapApiToRoute } from "../utils/mapApiToRoute";

export default function PageHeader({ module }) {
  const navigate = useNavigate();
  const { pathname } = useLocation(); 
  
  if (!module) return null;

  const visibleFeatures = [...module.features].reverse();
/*  
console.log("=== PageHeader DEBUG ===");
console.log("module:", module.moduleName);
console.log("features:", module.features);
console.log("location.pathname:", pathname);
*/
  return (
    <div className="d-flex align-items-center flex-wrap p-3">
      <div className="me-4">
        <h3 className="m-0">{module.moduleName}</h3>
      </div>

      <div className="d-flex flex-wrap gap-2 ms-auto">
        {visibleFeatures.map((f) => {
			const targetRoute = mapApiToRoute(f.url);
			const isActive = pathname === targetRoute || pathname.startsWith(targetRoute + '/');
			const buttonClass = isActive ? "btn btn-primary" : "btn btn-outline-primary";
			//console.log("PageHeader targetRoute: "+targetRoute);
			return (
			  <button
				key={f.featureId}
				className={buttonClass}
				style={{ minWidth: "100px" }}
				onClick={() => navigate(targetRoute)}
			  >
				{f.featureName}
			  </button>
			);
		  })}
      </div>
    </div>
  );
}
