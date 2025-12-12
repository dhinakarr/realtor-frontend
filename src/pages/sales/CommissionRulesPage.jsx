import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";

export default function CommissionRulesPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // projectId
  const [rules, setRules] = useState([]);
  const [roles, setRoles] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    ruleId: null,
    roleId: "",
    percentage: "",
  });

  useEffect(() => {
    loadRoles();
    loadRules();
  }, []);

  // 1. Load all roles
  const loadRoles = async () => {
    const res = await API.get("/api/roles");
    const data = Array.isArray(res.data?.data) ? res.data.data :
               Array.isArray(res.data) ? res.data : [];
	setRoles(data);
  };

  // 2. Load all rules for the project
  const loadRules = async () => {
    const res = await API.get(`/api/commission-rules/project/${id}`);
    const data = Array.isArray(res.data?.data) ? res.data.data :
               Array.isArray(res.data) ? res.data : [];
	setRules(data);
  };

  const openAddModal = () => {
    setForm({
      ruleId: null,
      roleId: "",
      percentage: "",
    });
    setShowModal(true);
  };

  const openEditModal = (rule) => {
    setForm(rule);
    setShowModal(true);
  };

  const saveRule = async () => {
    if (!form.roleId || !form.percentage) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      projectId: id,
      roleId: form.roleId,
      percentage: form.percentage,
    };

    if (form.ruleId) {
      await API.patch(`/api/commission-rules/${form.ruleId}`, payload);
      toast.success("Rule updated");
    } else {
      await API.post("/api/commission-rules", payload);
      toast.success("Rule added");
    }

    setShowModal(false);
    loadRules();
  };

  const deleteRule = (ruleId) => {
    confirmAlert({
      title: "Confirm Delete",
      message: "Delete this rule?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            await API.delete(`/api/commission-rules/${ruleId}`);
            toast.success("Deleted");
            loadRules();
          },
        },
        { label: "No" },
      ],
    });
  };

  return (
    <div>
		<div
		  className="d-flex justify-content-between align-items-center mb-4"
		  style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px" }}
		>
		  {/* Left: Page Title */}
		  <h3 className="m-0">Commission Rules</h3>

		  {/* Right: Buttons */}
		  <div className="d-flex align-items-center gap-3">

			{/* Back Button */}
			<button
			  className="btn btn-outline-secondary"
			  onClick={() => navigate(`/projects/details/${id}`)}
			>
			  <FaArrowLeft className="me-1" /> Back 
			</button>

			{/* Add Rule Button */}
			<button
			  className="btn btn-primary"
			  onClick={openAddModal}
			>
			  <FaPlus className="me-1" /> Create Rule
			</button>
		  </div>
		</div>

   

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Role</th>
            <th>Percentage (per sqft)</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {(!rules || rules.length === 0) ? (
            <tr>
              <td colSpan="3" className="text-center text-muted">
                No rules found for this project
              </td>
            </tr>
          ) : (
            rules.map((r) => (
              <tr key={r.ruleId}>
                <td>{r.roleName}</td>
                <td>{r.percentage}</td>
                <td>
				  
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => openEditModal(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteRule(r.ruleId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>{form.ruleId ? "Edit Rule" : "Add Rule"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label>Role</label>
                  <select
                    className="form-select"
                    value={form.roleId}
                    onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  >
                    <option value="">Select Role</option>
                    {roles.map((r) => (
                      <option key={r.roleId} value={r.roleId}>
                        {r.roleName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label>Percentage</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.percentage}
                    onChange={(e) =>
                      setForm({ ...form, percentage: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={saveRule}>
                  Save
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
