import React, { useEffect, useState } from "react";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PermissionCreatePage() {
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [features, setFeatures] = useState([]);

  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    const res = await API.get("/api/permissions/form");
    setRoles(res.data.data.roles);
    setModules(res.data.data.modules);
  };

  const handleModuleChange = (moduleId) => {
    setSelectedModuleId(moduleId);

    const module = modules.find((m) => m.moduleId === moduleId);
    if (module) {
      setFeatures(module.features);

      // Build blank CRUD object for each feature
      const initial = {};
      module.features.forEach((f) => {
        initial[f.featureId] = {
          create: false,
          read: false,
          update: false,
          delete: false,
        };
      });

      setPermissions(initial);
    }
  };

  const togglePermission = (featureId, action) => {
    setPermissions((prev) => ({
      ...prev,
      [featureId]: {
        ...prev[featureId],
        [action]: !prev[featureId][action],
      },
    }));
  };

  const handleSubmit = async () => {
	  if (!selectedRoleId || !selectedModuleId) {
		toast.error("Select role & module");
		return;
	  }

	  // permissions = { featureId: {canCreate,canRead,...}, ... }
	  const permissionsPayload = Object.entries(permissions).map(([featureId, actions]) => ({
		featureId,
		canCreate: actions.create || false,
		canRead: actions.read || false,
		canUpdate: actions.update || false,
		canDelete: actions.delete || false,
	  }));

	  console.log("Sending payload:", permissionsPayload);

	  try {
		const res = await API.post(
		  `/api/permissions/bulk/${selectedRoleId}`,  // MUST embed roleId
		  permissionsPayload                          // MUST be an array
		);

		if (res.data.success) {
		  toast.success("Permissions saved successfully!", {
			autoClose: 10000, // 10 seconds
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
		  });
		}
	  } catch (err) {
		console.error(err);
		toast.error("Error saving permissions", { autoClose: 10000 });
	  }
	};

  return (
    <div className="container mt-3">
      <PageHeader title="Create ACL Permissions" />

      {/* ROLE DROPDOWN */}
      <div className="mb-3">
        <label className="form-label">Role</label>
        <select
          className="form-select"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
        >
          <option value="">-- Select Role --</option>
          {roles.map((r) => (
            <option key={r.roleId} value={r.roleId}>
              {r.roleName}
            </option>
          ))}
        </select>
      </div>

      {/* MODULE DROPDOWN */}
      <div className="mb-3">
        <label className="form-label">Module</label>
        <select
          className="form-select"
          value={selectedModuleId}
          onChange={(e) => handleModuleChange(e.target.value)}
        >
          <option value="">-- Select Module --</option>
          {modules.map((m) => (
            <option key={m.moduleId} value={m.moduleId}>
              {m.moduleName}
            </option>
          ))}
        </select>
      </div>

      {/* FEATURES TABLE */}
      {selectedModuleId && (
        <div className="card p-3">
          <h5>Feature Permissions</h5>

          {features.length === 0 ? (
            <p className="text-muted">No features available</p>
          ) : (
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Create</th>
                  <th>Read</th>
                  <th>Update</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f) => (
                  <tr key={f.featureId}>
                    <td>{f.featureName}</td>

                    {["create", "read", "update", "delete"].map((action) => (
                      <td key={action} className="text-center">
                        <input
                          type="checkbox"
                          checked={permissions[f.featureId]?.[action] || false}
                          onChange={() =>
                            togglePermission(f.featureId, action)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* SAVE BUTTON */}
      <button className="btn btn-primary justify-content-center mt-3" onClick={handleSubmit}>
        Save Permissions
      </button>
	  
	  <ToastContainer position="top-right" />
    </div>
  );
  
}
