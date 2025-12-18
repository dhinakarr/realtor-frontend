import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import API from "../../api/api";
import "./CustomerEditOverlay.css";

export default function CustomerEditOverlay({ show, customerId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState({});
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [originalValues, setOriginalValues] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const BASE_URL = API.defaults.baseURL; 

  useEffect(() => {
    if (show && customerId) {
      loadCustomerForm();
    }
  }, [show, customerId]);
  
  const validateField = (field, value) => {
	  const err = [];
	  const extra = field.extraSettings || {};
	  const stringValue = value?.toString().trim() || "";

	  if (field.required && !stringValue) {
		err.push(`${field.displayLabel} is required`);
	  }

	  if (extra.minLength && stringValue.length < extra.minLength) {
		err.push(`Minimum ${extra.minLength} characters required`);
	  }

	  if (extra.maxLength && stringValue.length > extra.maxLength) {
		err.push(`Maximum ${extra.maxLength} characters allowed`);
	  }

	  if (extra.pattern && stringValue) {
		const regex = new RegExp(extra.pattern);
		if (!regex.test(stringValue)) {
		  err.push(extra.patternMessage || "Invalid format");
		}
	  }

	  return err;
	};


  const loadCustomerForm = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/api/customers/form/${customerId}`);
      const result = response.data.data;

      setCustomer(result.data);
      setFields(result.form.fields);

      // Preload existing data
      setFormValues(result.data);
	  setOriginalValues(result.data);
    } catch (err) {
      console.error("Error loading form:", err);
    }
    setLoading(false);
  };

  const updateFieldValue = (field, value) => {
    setFormValues(prev => ({ ...prev, [field.apiField]: value }));
	const fieldErrors = validateField(field, value);
	setErrors(prev => ({
		...prev,
		[field.apiField]: fieldErrors[0] // store first error
	  }));
  };

  const handleFileChange = e => {
    setProfileFile(e.target.files[0]);
  };
  
  const getChangedFields = () => {
    const changed = {};
    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== originalValues[key]) {
        changed[key] = formValues[key];
      }
    });
    return changed;
  };
  
  const validateForm = () => {
	  const newErrors = {};

	  fields.forEach(field => {
		if (field.hidden) return;

		const value = formValues[field.apiField];
		const fieldErrors = validateField(field, value);

		if (fieldErrors.length > 0) {
		  newErrors[field.apiField] = fieldErrors[0];
		}
	  });

	  setErrors(newErrors);
	  return Object.keys(newErrors).length === 0;
	};


  const handleSubmit = async e => {
    e.preventDefault();
	if (!validateForm()) {

		return; // ❌ STOP submission
	  }
	const changed = getChangedFields();
    const formData = new FormData();
	
	if (Object.keys(changed).length === 0 && !profileFile) {
      alert("No changes to update.");
      return;
    }
	
	formData.append("customer",
        new Blob([JSON.stringify(changed)], { type: "application/json" })
      );
	//formData.append("customer", JSON.stringify(formValues));
    if (profileFile) {
		console.log("image section called");
		formData.append("profileImage", profileFile);
	}
	/*
    try {
      await API.patch(`/api/customers/${customerId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
    } */
  };
  
  const handleDeleteImage = async () => {
	  //if (!window.confirm("Are you sure you want to delete the profile image?")) return;

	  try {
		await API.delete(`/api/customers/image/${customerId}`);

		// Remove from local state
		setCustomer(prev => ({ ...prev, profileImagePath: null }));

		// Show toast — replace with your toast function
		if (window?.toast) {
		  window.toast.success("Profile image deleted successfully");
		} else {
		  alert("Profile image deleted successfully");
		}
		onClose();
	  } catch (err) {
		console.error("Image delete failed:", err);
		if (window?.toast) {
		  window.toast.error("Failed to delete image");
		} else {
		  alert("Failed to delete image");
		}
	  }
	};
  
  if (!show) return null;

  return (
    <>
      {/* Background Overlay */}
      <div className="overlay-bg" onClick={onClose}></div>

      {/* Sliding Panel */}
      <div className={`edit-panel ${show ? "open" : ""}`}>
        <div className="panel-header">
          <h3>Edit Customer</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="form-container">
            {fields
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(field => {
                if (field.hidden) return null;

                const name = field.apiField;
                const label = field.displayLabel;
                const type = field.fieldType;
                const extra = field.extraSettings || {};

                return (
                  <div key={name} className={`form-group ${
						field.fieldType === "textarea" ||
						field.fieldType === "file" ||
						field.fieldType === "radio"
						  ? "full-width"
						  : ""
					  }`}>
                    <label>{label}</label>

                    {type === "text" || type === "email" || type === "number" ? (
                      <input
                        type={type}
						
                        value={formValues[name] || ""}
                        placeholder={extra.placeholder}
						className={`form-control ${errors[name] ? "is-invalid" : ""}`}
                        onChange={e => updateFieldValue(field, e.target.value)}
                      />
                    ) : null}
					{errors[name] && (
					  <div className="error-text">{errors[name]}</div>
					)}
                    {type === "textarea" && (
                      <textarea
                        value={formValues[name] || ""}
                        placeholder={extra.placeholder}
                        onChange={e => updateFieldValue(field, e.target.value)}
                      />
                    )}

                    {type === "date" && (
                      <input
                        type="date"
                        value={formValues[name] || ""}
                        onChange={e => updateFieldValue(field, e.target.value)}
                      />
                    )}

                    {type === "radio" && (
                      <div className="radio-group">
                        {field.lookupData?.map(opt => (
                          <label key={opt.key}>
                            <input
                              type="radio"
                              name={name}
                              checked={formValues[name] === opt.key}
                              onChange={() => updateFieldValue(field, opt.key)}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    )}

                    {type === "file" && (
					  <div className="image-wrapper">
						<input type="file" onChange={handleFileChange} />

						{customer.profileImagePath && (
						  <div className="image-preview-box">
							<img
							  src={BASE_URL + customer.profileImagePath}
							  alt="Profile"
							  className="preview-img"
							/>

							<button
							  type="button"
							  className="image-delete-icon"
							  onClick={() => setShowDeleteConfirm(true)}
							>
							  ×
							</button>
						  </div>
						)}
					  </div>
					)}
                  </div>
                );
              })}

            <button type="submit" className="save-btn">
              Update Customer
            </button>
          </form>
        )}
		
		{showDeleteConfirm && (
		  <div className="confirm-overlay">
			<div className="confirm-box">	
			  <p>Delete profile image?</p>

			  <div className="confirm-actions">
				<button
				  className="btn-danger"
				  onClick={() => {
					setShowDeleteConfirm(false);
					handleDeleteImage();
				  }}
				>
				  Yes, Delete
				</button>

				<button
				  className="btn-secondary"
				  onClick={() => setShowDeleteConfirm(false)}
				>
				  Cancel
				</button>
			  </div>
			</div>
		  </div>
		)}
		

      </div>
    </>
  );
}
