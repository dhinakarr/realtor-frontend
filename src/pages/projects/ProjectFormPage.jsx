// src/pages/projects/ProjectFormPage.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";

export default function ProjectFormPage() {
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formMeta, setFormMeta] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [changedFields, setChangedFields] = useState({});
  
  const { id } = useParams();
  const isEditMode = !!id;
  const BASE_URL = API.defaults.baseURL;
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");

  // Load form metadata
  useEffect(() => {
    loadFormMeta();
  }, [id]);

  // ------------------------------------------------------------
  // VALIDATION ENGINE
  // ------------------------------------------------------------
  const validateForm = (values) => {
    let errors = {};

    formFields.forEach((field) => {
      const rules = field.extraSettings;

      if (rules?.mustBeAfter) {
        const start = values[rules.mustBeAfter];
        const end = values[field.name];

        if (start && end && new Date(end) <= new Date(start)) {
          errors[field.name] = `${field.label} must be after ${rules.mustBeAfter}`;
        }
      }
    });

    return errors;
  };

  // ------------------------------------------------------------
  // LOAD FORM METADATA
  // ------------------------------------------------------------
  const loadFormMeta = async () => {
    try {
      const url = isEditMode
        ? `/api/projects/form/${id}`
        : "/api/projects/form";

      const res = await API.get(url);
      const form = res.data?.data?.form;
      const record = res.data?.data?.data;
//console.log("ProjectFormPage.loadFormMeta res: "+res);
      if (!form) return;

      const mapped = form.fields.map((f) => ({
        name: f.apiField,
        label: f.displayLabel,
        type: f.fieldType,
        required: f.extraSettings?.required || false,
        extraSettings: f.extraSettings || {},
        options: f.lookupData || null,
      }));

      setFormFields(mapped);

      if (isEditMode && record) {
        setFormValues({
          ...record,
          existingFiles: record.files || [],
          newFiles: [],
        });
		console.log("ProjectFormPage.loadFormMeta inside edit mode: ");
      }
	  
    } catch (err) {
      console.error("Form load failed", err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // DELETE FILE HANDLER
  // ------------------------------------------------------------
  const handleDeleteFile = async (fileId) => {
	  //console.log("@handleDeleteFile fileId: "+fileId);
    try {
      const res = await API.delete(`/api/projects/file/delete/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        toast.success("File deleted");

        setFormValues((prev) => ({
          ...prev,
          existingFiles: prev.existingFiles.filter(
            (f) => f.projectFileId !== fileId
          ),
        }));
      } else {
        toast.error(res.data?.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete file error", error);
      toast.error("Error deleting file");
    }
  };
  
  // ------------------------------------------------------------
  // TRACK FIELD CHANGES HANDLER
  // ------------------------------------------------------------
  const updateField = (name, value) => {
	  const updated = { ...formValues, [name]: value };
	  const errors = validateForm(updated);

	  setFormValues(updated);
	  setFormErrors(errors);

	  // Track only in EDIT mode
	  if (isEditMode) {
		setChangedFields((prev) => ({
		  ...prev,
		  [name]: value
		}));
	  }
	};
	
  // ------------------------------------------------------------
  // SUBMIT HANDLER
  // ------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {};

	  if (isEditMode) {
		payload = {
		  projectId: formValues.projectId,
		  ...changedFields           // only updated fields
		};
	  } else {
		payload = { ...formValues };  // send all for create
	  }
	
	formFields.forEach((field) => {
		if (field.type === "number" && payload[field.name] != null) {
		  payload[field.name] = Number(payload[field.name]);
		}
	  });
	
    const formDataToSend = new FormData();
	
	Object.keys(payload).forEach(key => {
	  // skip arrays or file properties
	  if (key !== "newFiles" && key !== "existingFiles")
		  formDataToSend.append(key, payload[key]);
	});

    if (formValues.newFiles && formValues.newFiles.length > 0) {
      formValues.newFiles
      .filter(f => f instanceof File)
      .forEach((f) => formDataToSend.append("files", f));
    }

    try {
      let res;
//console.log("ProjectFormPage.handleSubmit isEditMode: "+isEditMode);
      if (isEditMode) {
        res = await API.patch(`/api/projects/${id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Project updated successfully!");
      } else {
        res = await API.post("/api/projects/all", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
		//console.log("ProjectFormPage.handleSubmit res: "+res);
        toast.success("Project created successfully!");
      }

      navigate("/projects/list");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Error saving project");
    }
  };

  if (loading) return <p>Loading Form…</p>;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div
        className="p-4"
        style={{
          width: "100%",
          maxWidth: "900px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="m-0">
            {isEditMode ? "Edit Project" : "Create Project"}
          </h3>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/projects/list")}
          >
            ← Back
          </button>
        </div>

        {formFields.length === 0 && (
          <p className="text-danger">No form metadata received.</p>
        )}

        <form onSubmit={handleSubmit} className="row g-4">
          {formFields.map((field) => (
            <div key={field.name} className="col-md-6">
              <label className="form-label fw-semibold">
                {field.label}
              </label>

              {/* TEXT */}
              {field.type === "text" && (
                <input
                  type="text"
                  className="form-control"
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    updateField(field.name, e.target.value)
                  }
                  required={field.required}
                />
              )}

              {/* NUMBER */}
              {field.type === "number" && (
                <input
                  type="number"
                  className="form-control"
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    updateField(field.name, e.target.value)
                  }
                  required={field.required}
                />
              )}

              {/* TEXTAREA */}
              {field.type === "textarea" && (
                <textarea
                  rows="3"
                  className="form-control"
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    updateField(field.name, e.target.value)
                  }
                  required={field.required}
                />
              )}

              {/* DATE */}
              {field.type === "date" && (
                <input
                  type="date"
                  className="form-control"
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    updateField(field.name, e.target.value)
                  }
                  required={field.required}
                />
              )}

              {/* FILE FIELD (CREATE + EDIT) */}
              {field.type === "file" && (
                <div>
                  {/* EXISTING FILES (EDIT MODE) */}
                  {isEditMode &&
                    formValues.existingFiles?.length > 0 && (
                      <div className="mb-2 d-flex flex-wrap">
                        {formValues.existingFiles.map((f) => {
                          const imgUrl = `${BASE_URL}/api/projects/file/${f.projectFileId}`
console.log("imgUrl: "+imgUrl);
                          return (
                            <div
                              key={f.projectFileId}
                              className="position-relative me-2 mb-2"
                              style={{ display: "inline-block" }}
                            >
                              <img
                                src={imgUrl}
                                alt=""
                                style={{
                                  height: "90px",
                                  width: "120px",
                                  objectFit: "cover",
                                  borderRadius: "6px",
                                  border: "1px solid #ddd",
                                }}
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteFile(f.projectFileId)
                                }
                                className="btn btn-danger btn-sm position-absolute"
                                style={{
                                  top: "-8px",
                                  right: "-8px",
                                  borderRadius: "50%",
                                  padding: "2px 6px",
                                  lineHeight: "10px",
                                }}
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* NEW FILES */}
                  <input
                    type="file"
                    multiple
                    className="form-control"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files);
                      setFormValues((prev) => ({
                        ...prev,
                        newFiles: [
                          ...(prev.newFiles || []),
                          ...newFiles,
                        ],
                      }));
                    }}
                  />
                </div>
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <select
                  className="form-select"
                  value={formValues[field.name] || ""}
                  onChange={(e) =>
                    updateField(field.name, e.target.value)
                  }
                  required={field.required}
                >
                  <option value="">Select</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {/* FIELD ERRORS */}
              {formErrors[field.name] && (
                <small className="text-danger">
                  {formErrors[field.name]}
                </small>
              )}
            </div>
          ))}

          <div className="col-12 mt-3 text-center">
            <button type="submit" className="btn btn-success px-4">
              Save
            </button>

            <button
              type="button"
              className="btn btn-secondary ms-3 px-4"
              onClick={() => navigate("/projects/list")}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
