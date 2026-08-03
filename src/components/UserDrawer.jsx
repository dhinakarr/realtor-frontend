// UserDrawer.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./UserDrawer.css";
import { useToast } from "../components/common/ToastProvider";
import { FaTimes } from "react-icons/fa";

function UserDrawer({ open, onClose }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const { showToast } = useToast();
  
  useEffect(() => {
	  if (!open) return;

	  const currentUser = JSON.parse(localStorage.getItem("user"));
	  const userId =
		currentUser?.token?.userId ||
		currentUser?.userId ||
		currentUser?.i ||
		currentUser?.user_id;

	  if (!userId) return;

	  API.get("/api/users/form").then(res => {
		const requiredFields = res.data.data.fields
		  .filter(f => f.required && !f.hidden)
		  .sort((a, b) => a.sortOrder - b.sortOrder);

		setFields(requiredFields);
		
		const roleField = requiredFields.find(f => f.apiField === "roleId");
		const projectAssociate = roleField?.lookupData?.find(
			  opt => opt.value?.toLowerCase() === "project associate"
			);

		setFormData(prev => ({
		  ...prev,
		  managerId: userId,
			roleId: projectAssociate?.key || ""
		}));
	  });
	  
	}, [open]);

  
  const validate = () => {
	  const newErrors = {};
	  fields.forEach(field => {
		if (!formData[field.apiField]) {
		  newErrors[field.apiField] = `${field.displayLabel} is required`;
		}
	  });
	  setErrors(newErrors);
	  return Object.keys(newErrors).length === 0;
	};
  
  const handleChange = (key, value) => {
	if (key === "managerId") return;
    setFormData(prev => ({ ...prev, [key]: value }));
	setErrors(prev => ({ ...prev, [key]: "" }));
  };

  const renderField = field => {
	  const currentUser = JSON.parse(localStorage.getItem("user"));

	  const userId =
		currentUser?.token?.userId ||
		currentUser?.userId ||
		currentUser?.i ||
		currentUser?.user_id;

	  const isManager = field.apiField === "managerId";

	  const value =
		formData[field.apiField] ??
		(isManager ? userId : "");

	  const commonProps = {
		className: "form-control",
		value,
		onChange: e => handleChange(field.apiField, e.target.value),
		disabled: isManager
	  };

	  switch (field.fieldType) {
		case "text":
		case "email":
		case "number":
		  return <input type={field.fieldType} {...commonProps} />;

		case "textarea":
		  return <textarea {...commonProps} />;

		case "select":
		  return (
			<select {...commonProps}>
			  <option value="">Select</option>
			  {field.lookupData?.filter(
				(opt) => !(opt.value?.toLowerCase() === "customer")
			  )
			  .map(opt => (
				<option key={opt.key} value={opt.key}>
				  {opt.value}
				</option>
			  ))}
			</select>
		  );

		default:
		  return <input type="text" {...commonProps} />;
	  }
	};

  const handleSubmit = async () => {
	  try {
		const isValid = validate();
		console.log("isValid:", isValid);

		if (!isValid) return;

		const form = new FormData();
		form.append("dto", JSON.stringify(formData));
		if(file) 
			form.append("profileImage", file);

		await API.post("/api/users", form, {
		  headers: { "Content-Type": "multipart/form-data" }
		});
		showToast("User created successfully", "success");
		
		onClose();
	  } catch (err) {
		const message =
			err.response?.data?.message ||   // from backend
			err.message ||                   // fallback
			"Something went wrong";

		  showToast(message, "danger");
	  }
	};

  return (
  <>
    {open && (
      <div className="drawer-backdrop" onClick={onClose}>
        
        <div
          className="drawer open"
          onClick={(e) => e.stopPropagation()} // ✅ prevent close
        >
          {/* HEADER */}
          <div className="drawer-header">
            <h5>Create User</h5>
            <span className="close-icon" onClick={onClose}>
              <FaTimes />
            </span>
          </div>

          {/* BODY */}
          <div className="drawer-body">
            <div className="row">
              {fields.map(field => (
                <div className="col-6 mb-3" key={field.apiField}>
                  <label className="form-label">
                    {field.displayLabel} *
                  </label>

                  {renderField(field)}

                  {errors[field.apiField] && (
                    <div
                      className="text-danger mt-1"
                      style={{ fontSize: "0.85rem" }}
                    >
                      {errors[field.apiField]}
                    </div>
                  )}
                </div>
              ))}

              {/* Image Upload */}
              <div className="col-12 mb-3">
                <label className="form-label">Profile Image</label>
                <input
                  type="file"
                  className="form-control"
                  onChange={e => setFile(e.target.files[0])}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Save
              </button>
            </div>
          </div>
        </div>

      </div>
    )}
  </>
);
}

export default UserDrawer;