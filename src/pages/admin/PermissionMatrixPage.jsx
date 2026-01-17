// src/pages/admin/PermissionMatrixPage.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { useToast } from "../../components/common/ToastProvider";

export default function PermissionMatrixPage() {
  const featureUrl = "/api/permissions";
  const module = useModule(featureUrl);
  const { showToast } = useToast();

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [modules, setModules] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- Load Roles ---------------- */
  useEffect(() => {
    API.get("/api/roles")
      .then(res => {
        const data = res.data?.data || [];
        setRoles(data);
        if (data.length > 0) {
          setSelectedRole(data[0].roleId);
        }
      })
      .catch(() => {});
  }, []);

  /* ------------- Load Permissions ------------- */
  useEffect(() => {
    if (!selectedRole) return;

    setLoading(true);
    API.get(`/api/permissions?roleId=${selectedRole}`)
      .then(res => {
        const rawModules = res.data?.data || [];
		
		const normalized = rawModules.map(module => ({
		  ...module,
		  features: module.features.reduce((acc, f) => {
			const existing = acc.find(x => x.featureId === f.featureId);

			if (!existing) {
			  acc.push({
				featureId: f.featureId,
				featureName: f.featureName,
				canRead: false,
				canCreate: false,
				canUpdate: false,
				canDelete: false
			  });
			}

			if (f.roleId === selectedRole) {
			  const target = acc.find(x => x.featureId === f.featureId);
			  target.canRead = f.canRead;
			  target.canCreate = f.canCreate;
			  target.canUpdate = f.canUpdate;
			  target.canDelete = f.canDelete;
			}

			return acc;
		  }, [])
		}));

		setModules(normalized);
	
        setDirty(false);
      })
      .finally(() => setLoading(false));
  }, [selectedRole]);

  /* -------- Toggle Permission -------- */
  const togglePermission = (moduleId, featureId, perm) => {
    setModules(prev =>
      prev.map(m =>
        m.moduleId !== moduleId
          ? m
          : {
              ...m,
              features: m.features.map(f => {
                if (f.featureId !== featureId) return f;

                const updated = { ...f, [perm]: !f[perm] };

                // If READ turned off → disable others
                if (perm === "canRead" && f.canRead) {
                  updated.canCreate = false;
                  updated.canUpdate = false;
                  updated.canDelete = false;
                }

                return updated;
              })
            }
      )
    );
    setDirty(true);
  };

  /* -------- Save (Bulk) -------- */
  const savePermissions = async () => {
    setSaving(true);

    const payload = {
      roleId: selectedRole,
      permissions: modules.flatMap(m =>
        m.features.map(f => ({
          featureId: f.featureId,
          canRead: f.canRead,
          canCreate: f.canCreate,
          canUpdate: f.canUpdate,
          canDelete: f.canDelete
        }))
      )
    };

    try {
      await API.post(`/api/permissions/bulk/${selectedRole}`, payload.permissions);
      setDirty(false);
	  showToast("Permissions Saved successfully", "success");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="container-fluid">
      {module && <PageHeader module={module} />}

      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center">
		  <div className="d-flex align-items-center gap-3">
			<label className="fw-semibold">Role:</label>
			<select
			  className="form-select w-auto"
			  
			  onChange={e => setSelectedRole(e.target.value)}
			>
				<option selected value="">Select Role</option>
			  {roles.map(r => (
				<option key={r.roleId} value={r.roleId}>
				  {r.roleName}
				</option>
			  ))}
			</select>
		  </div>

		  <div className="flex-shrink-0">
			<button
			  className="btn btn-success px-4"
			  disabled={!dirty || saving}
			  onClick={savePermissions}
			>
			  {saving ? "Saving..." : "Save Changes"}
			</button>
		  </div>
		</div>


      {/* Permission Matrix */}
      {loading ? (
        <div className="text-muted">Loading permissions...</div>
      ) : (
        modules.map(m => (
          <div key={m.moduleId} className="mb-4">
            <h6 className="fw-bold">{m.moduleName}</h6>
			<div className="table-responsive w-100">
            <table className="table table-bordered table-hover table-sm permission-table">
			  <colgroup>
				<col style={{ width: "30%" }} />
				<col style={{ width: "15%" }} />
				<col style={{ width: "15%" }} />
				<col style={{ width: "15%" }} />
				<col style={{ width: "15%" }} />
			  </colgroup>

			  <thead className="table-light">
				<tr>
				  <th>Feature</th>
				  <th className="text-center">View</th>
				  <th className="text-center">Create</th>
				  <th className="text-center">Update</th>
				  <th className="text-center">Delete</th>
				</tr>
			  </thead>

              <tbody>
				  {m.features.map(f => (
					<tr key={f.featureId}>
					  <td>{f.featureName}</td>

					  {["canRead", "canCreate", "canUpdate", "canDelete"].map(p => (
						<td key={p} className="text-center">
						  <input
							type="checkbox"
							checked={f[p]}
							disabled={p !== "canRead" && !f.canRead}
							onChange={() =>
							  togglePermission(m.moduleId, f.featureId, p)
							}
						  />
						</td>
					  ))}
					</tr>
				  ))}
				</tbody>


            </table>
			</div>
          </div>
        ))
      )}

      {/* Sticky Footer */}
      <div className="permission-footer">
		  <div className="d-flex justify-content-end">
			<button
			  type="button"
			  className="btn btn-primary save-btn"
			  disabled={!dirty || saving}
			  onClick={savePermissions}
			>
			  {saving ? "Saving..." : "Save Changes"}
			</button>
		  </div>
		</div>


    </div>
  );
}
