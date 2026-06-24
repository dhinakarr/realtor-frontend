import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import API from "../../api/api";
import "./CommissionRuleCreate.css";
import { useToast } from "../../components/common/ToastProvider";
import { FaEdit, FaTrash } from "react-icons/fa";
import useModule from "../../hooks/useModule";

export default function CommissionRuleCreate() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const location = useLocation();
  const projectName = location.state?.projectName;

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const { showToast } = useToast();
  const [editingRuleId, setEditingRuleId] = useState(null);
  const isEditMode = Boolean(editingRuleId);
  
  const commissionUrl = "/api/commission-rules";
  const commissionModule = useModule(commissionUrl);
  //console.log("commissionModule: "+JSON.stringify(commissionModule));
  const rulesFlag = commissionModule?.features?.find(r => r.url === commissionUrl);

  const rCreate = rulesFlag?.canCreate ?? false;
  const canEdit   = rulesFlag?.canUpdate ?? false;
  const canDelete = rulesFlag?.canDelete ?? false;
  
  const hierarchyOptions = [
					  { value: null, label: "Select" },
					  { value: 0, label: "Seller (Level 0)" },
					  { value: 1, label: "Parent (Level 1)" },
					  { value: 2, label: "Grand Parent (Level 2)" }
					];
  
  useEffect(() => {
	  if (!projectId) return;

	  setLoadingRules(true);
	  API.get(`/api/commission-rules/${projectId}`)
		.then(res => setRules(res.data?.data || []))
		.catch(err => console.error("Failed to load rules", err))
		.finally(() => setLoadingRules(false));
	}, [projectId]);


  const [form, setForm] = useState({
    projectId,
    roleId: "",
    userId: "",
	hierarchyDepth: null, // NEW
    commissionType: "PERCENTAGE", // PERCENTAGE | AMOUNT_PER_SQFT
    commissionValue: "",
    priority: 1,
    effectiveFrom: "",
    active: true
  });

  /* =========================
     Load roles on mount
  ========================= */
  useEffect(() => {
    API.get("/api/roles")
      .then(res => setRoles(res.data?.data || []))
      .catch(err => console.error("Failed to load roles", err));
  }, []);

  /* =========================
     Load users when role changes (USER scope)
  ========================= */
  useEffect(() => {
	  if (!form.roleId) {
		setUsers([]);
		return;
	  }

	  setLoadingUsers(true);
	  API.get(`/api/users/role/${form.roleId}`)
		.then(res => setUsers(res.data?.data || []))
		.catch(err => console.error("Failed to load users", err))
		.finally(() => setLoadingUsers(false));

	}, [form.roleId]);


  /* =========================
     Handlers
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
	
	let finalValue;

	  if (type === "checkbox") {
		finalValue = checked;
	  } else if (name === "hierarchyDepth") {
		finalValue = value === "" ? null : Number(value);
	  } else {
		finalValue = value;
	  }

    setForm(prev => ({
      ...prev,
	  [name]: finalValue
    }));

    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleScopeChange = (e) => {
    const scope = e.target.value;
    setForm(prev => ({
      ...prev,
      scope,
      roleId: "",
      userId: ""
    }));
    setUsers([]);
  };

  /* =========================
     Validation
  ========================= */
  const validate = () => {
    const e = {};

    if (!form.roleId) e.roleId = "Role is required";
    
    if (!form.commissionValue || Number(form.commissionValue) <= 0)
      e.commissionValue = "Commission value must be > 0";

    if (!form.effectiveFrom)
      e.effectiveFrom = "Effective from date is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* =========================
     Submit
  ========================= */
  const handleSubmit = async () => {
	  if (!validate()) return;

	  if (!projectId) {
		showToast("ProjectId is required", "danger");
		return;
	  }

	  const payload = {
		roleId: form.roleId,
		userId: form.userId || null,
		hierarchyDepth: form.hierarchyDepth === null || form.hierarchyDepth === "" ? null : Number(form.hierarchyDepth),
		commissionType: form.commissionType,
		commissionValue: Number(form.commissionValue),
		priority: Number(form.priority),
		effectiveFrom: form.effectiveFrom,
		active: form.active
	  };

	  try {
		if (isEditMode) {
		  // ✅ EDIT
		  await API.patch(
			`/api/commission-rules/rules/${editingRuleId}`,
			payload
		  );
		  showToast("Commission rule updated successfully", "success");
		} else {
		  // ✅ CREATE
		  await API.post("/api/commission-rules/add", {
			...payload,
			projectId
		  });
		  showToast("Commission rule created successfully", "success");
		}

		// Reload rules
		setLoadingRules(true);
		const response = await API.get(`/api/commission-rules/${projectId}`);
		setRules(response.data?.data || []);
		setLoadingRules(false);

		// Reset form + edit state
		setForm(prev => ({
		  ...prev,
		  roleId: "",
		  userId: "",
		  hierarchyDepth: "",
		  commissionValue: "",
		  priority: 1,
		  effectiveFrom: "",
		  active: true
		}));
		setEditingRuleId(null);

	  } catch (err) {
		console.error("Save failed", err);
		showToast(
		  isEditMode
			? "Failed to update commission rule"
			: "Failed to create commission rule",
		  "danger"
		);
	  }
	};

  
  const handleEditRule = (rule) => {
	  setEditingRuleId(rule.ruleId);

	  // Prefill form for editing
	  setForm({
		projectId,
		roleId: rule.roleId,
		userId: rule.userId || "",
		hierarchyDepth: rule.distributionType === "DEPTH" ? rule.hierarchyDepth : "",
		commissionType: rule.commissionType,
		commissionValue: rule.commissionValue,
		priority: rule.priority,
		effectiveFrom: rule.effectiveFrom,
		active: rule.active
	  });

	  window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDeleteRule = async (ruleId) => {
	  if (!window.confirm("Are you sure you want to delete this rule?")) return;

	  try {
		await API.delete(`/api/commission-rules/deactivate/${ruleId}`);
		showToast("Commission rule deleted", "success");

		setRules(prev => prev.filter(r => r.ruleId !== ruleId));
	  } catch (err) {
		console.error("Delete failed", err);
		showToast("Failed to delete rule", "danger");
	  }
	};


  /* =========================
     Render
  ========================= */
  return (
    <div className="commission-rule-create">
      <div className="page-header">
		<h4>Create Payout Rule ({projectName})</h4>
		  <button
			type="button"
			className="btn-link"
			onClick={() => navigate(-1)}
		  >
			← Back
		  </button>
		</div>


		<div className="form-grid" style={{ width: "75%", textAlign: "center" }} >

		  {/* Role */}
		  <div className="form-field">
			<label>Select Role</label>
			<select name="roleId" value={form.roleId} onChange={handleChange}>
			  <option value="">Select role</option>
			  {roles.map(r => (
				<option key={r.roleId} value={r.roleId}>
				  {r.roleName}
				</option>
			  ))}
			  
			</select>
			{errors.roleId && <small className="error">{errors.roleId}</small>}
		  </div>
		  <div className="form-field">
			  <label>Hierarchy Level</label>
			  <select name="hierarchyDepth" value={form.hierarchyDepth ?? ""}
					onChange={handleChange}>
				  {hierarchyOptions.map(h => (
					<option key={h.value} value={h.value}>
					  {h.label}
					</option>
				  ))}
				</select>
			</div>

		  {/* User (filtered by role) */}
		  <div className="form-field">
			<label>Select User (Optional)</label>
			<select
			  name="userId"
			  value={form.userId}
			  disabled={!form.roleId || loadingUsers}
			  onChange={handleChange}
			>
			  <option value="">
				{loadingUsers ? "Loading users..." : "All users under role"}
			  </option>
			  {users.map(u => (
				<option key={u.userId} value={u.userId}>
				  {u.fullName}
				</option>
			  ))}
			</select>
		  </div>

		  {/* Commission Type */}
		  <div className="form-field">
			<label>Payout Type</label>
			<select
			  name="commissionType"			
			  value={form.commissionType}
			  onChange={handleChange}
			>
			  <option value="PERCENTAGE">Percentage</option>
			  <option value="PER_SQFT">Amount / Sqft</option>
			  <option value="FLAT">Flat</option>
			</select>
		  </div>

		  {/* Commission Value */}
		  <div className="form-field">
			<label>Payout Value</label>
			<input
			  type="number"
			  name="commissionValue"
			  value={form.commissionValue}
			  onChange={handleChange}
			/>
			{errors.commissionValue && (
			  <small className="error">{errors.commissionValue}</small>
			)}
		  </div>

		  {/* Priority */}
		  <div className="form-field">
			<label>Priority</label>
			<input
			  type="number"
			  name="priority"
			  value={form.priority}
			  onChange={handleChange}
			/>
		  </div>

		  {/* Effective From */}
		  <div className="form-field">
			<label>Effective From</label>
			<input
			  type="date"
			  name="effectiveFrom"
			  value={form.effectiveFrom}
			  onChange={handleChange}
			/>
			{errors.effectiveFrom && (
			  <small className="error">{errors.effectiveFrom}</small>
			)}
		  </div>

		  {/* Active */}
		  <div className="checkbox-row">
			<label>
			  <input
				type="checkbox"
				name="active"
				checked={form.active}
				onChange={handleChange}
			  />
			  &nbsp;Active
			</label>
		  </div>
		  
		  <div className="form-actions">
			  <button
				type="button"
				className="btn-outline"
				onClick={() => navigate(-1)}
			  >
				Cancel
			  </button>

			  <button
				type="button"
				className="btn-primary"
				onClick={handleSubmit}
			  >
				Save Rule
			  </button>
			</div>

		  
		</div>

		<hr style={{ margin: "32px 0" }} />

		<h5>Existing Payout Rules</h5>

		{loadingRules ? (
		  <p>Loading rules...</p>
		) : rules.length === 0 ? (
		  <p className="text-muted">No rules created for this project yet.</p>
		) : (
		  <table className="rules-table" style={{ width: "75%", textAlign: "center" }}>
			<thead>
			  <tr>
				<th>Role</th>
				<th>User</th>
				<th>Hierarchy</th>
				<th>Type</th>
				<th>Value</th>
				<th>Effective From</th>
				<th>Status</th>
				<th style={{ width: "90px", textAlign: "center" }}>Action</th>
			  </tr>
			</thead>
			<tbody>
			  {Array.isArray(rules) && rules.map(rule => (
				<tr key={rule.ruleId}>
				  <td>{rule.roleName}</td>
				  <td>{rule.userName}</td>
				  <td>
					  {rule.hierarchyDepth === 0 && "Seller"}
					  {rule.hierarchyDepth === 1 && "Parent"}
					  {rule.hierarchyDepth === 2 && "Grand Parent"}
				  </td>
				  <td>{rule.commissionType}</td>
				  <td>
					{rule.commissionType === "PERCENTAGE"
					  ? `${rule.commissionValue}%`
					  : rule.commissionValue}
				  </td>
				  <td>{rule.effectiveFrom}</td>
				  <td>{rule.active ? "Active" : "Inactive"}</td>
				  <td className="action-cell">
				  {canEdit && (
					<FaEdit
					  title="Edit"
					  className="action-icon edit"
					  onClick={() => handleEditRule(rule)}
					/>
				  )}
				  {canDelete && (
					<FaTrash
					  title="Delete"
					  className="action-icon delete"
					  onClick={() => handleDeleteRule(rule.ruleId)}
					/>
				  )}
				  </td>
				</tr>
			  ))}
			</tbody>
		  </table>
		)}

      
    </div>
  );
}
