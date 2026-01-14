import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../api/api";
import "./CommissionRuleCreate.css";
import { useToast } from "../../components/common/ToastProvider";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function CommissionRuleCreate() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [rules, setRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const { showToast } = useToast();
  const [editingRuleId, setEditingRuleId] = useState(null);
  const isEditMode = Boolean(editingRuleId);
  
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

    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
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
		<h4>Create Commission Rule</h4>
		  <button
			type="button"
			className="btn-link"
			onClick={() => navigate(-1)}
		  >
			← Back
		  </button>
		</div>


		<div className="form-grid">

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
			<label>Commission Type</label>
			<select
			  name="commissionType"			
			  value={form.commissionType}
			  onChange={handleChange}
			>
			  <option value="PERCENTAGE">Percentage</option>
			  <option value="AMOUNT_PER_SQFT">Amount / Sqft</option>
			  <option value="FLAT">Flat</option>
			</select>
		  </div>

		  {/* Commission Value */}
		  <div className="form-field">
			<label>Commission Value</label>
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

		<h5>Existing Commission Rules</h5>

		{loadingRules ? (
		  <p>Loading rules...</p>
		) : rules.length === 0 ? (
		  <p className="text-muted">No rules created for this project yet.</p>
		) : (
		  <table className="rules-table">
			<thead>
			  <tr>
				<th>Role</th>
				<th>User</th>
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
				  <td>{rule.commissionType}</td>
				  <td>
					{rule.commissionType === "PERCENTAGE"
					  ? `${rule.commissionValue}%`
					  : rule.commissionValue}
				  </td>
				  <td>{rule.effectiveFrom}</td>
				  <td>{rule.active ? "Active" : "Inactive"}</td>
				  <td className="action-cell">
					<FaEdit
					  title="Edit"
					  className="action-icon edit"
					  onClick={() => handleEditRule(rule)}
					/>
					<FaTrash
					  title="Delete"
					  className="action-icon delete"
					  onClick={() => handleDeleteRule(rule.ruleId)}
					/>
				  </td>
				</tr>
			  ))}
			</tbody>
		  </table>
		)}

      
    </div>
  );
}
