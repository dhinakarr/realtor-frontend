import React from "react";

export default function DynamicFormRenderer({
  form,
  record,
  updateField,
  errors = {},
  layout = { columns: 1 },
}) {
  if (!form || !form.fields) return null;

  const columnClass =
    layout.columns === 2 ? "col-12 col-md-6 mb-3" : "col-12 mb-3";

  const renderError = (field) =>
    errors[field] && (
      <div className="text-danger small mt-1">
        {errors[field]}
      </div>
    );

  const renderLabel = (f) => (
    <label className="form-label">
      {f.displayLabel}
      {f.required && <span className="text-danger ms-1">*</span>}
    </label>
  );

  return (
    <div className="row">
      {form.fields.map((f) => {
        const value = record[f.apiField] ?? "";
        const isMulti = f.extraSettings?.multiple === true;

        // TEXT
        if (["text", "string"].includes(f.fieldType)) {
          return (
            <div className={columnClass} key={f.apiField}>
              {renderLabel(f)}
              <input
                type="text"
                className="form-control"
                value={value}
                onChange={(e) =>
                  updateField(f.apiField, e.target.value)
                }
              />
              {renderError(f.apiField)}
            </div>
          );
        }

        // NUMBER
        if (f.fieldType === "number") {
          return (
            <div className={columnClass} key={f.apiField}>
              {renderLabel(f)}
              <input
                type="number"
                className="form-control"
                value={value}
                onChange={(e) =>
                  updateField(f.apiField, e.target.value)
                }
              />
              {renderError(f.apiField)}
            </div>
          );
        }

        // DATE
        if (f.fieldType === "date") {
          return (
            <div className={columnClass} key={f.apiField}>
              {renderLabel(f)}
              <input
                type="date"
                className="form-control"
                value={value}
                onChange={(e) =>
                  updateField(f.apiField, e.target.value)
                }
              />
              {renderError(f.apiField)}
            </div>
          );
        }

        // SELECT / MULTISELECT
        if (f.fieldType === "select") {
          return (
            <div className={columnClass} key={f.apiField}>
              {renderLabel(f)}
              <select
                className="form-select"
                multiple={isMulti}
                value={isMulti ? value || [] : value}
                onChange={(e) =>
                  updateField(
                    f.apiField,
                    isMulti
                      ? Array.from(
                          e.target.selectedOptions,
                          (o) => o.value
                        )
                      : e.target.value
                  )
                }
              >
                {!isMulti && (
                  <option value="">
                    Select {f.displayLabel}
                  </option>
                )}
                {f.lookupData?.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.value}
                  </option>
                ))}
              </select>
              {renderError(f.apiField)}
            </div>
          );
        }

        // TEXTAREA
        if (f.fieldType === "textarea") {
          return (
            <div className="col-12 mb-3" key={f.apiField}>
              {renderLabel(f)}
              <textarea
                className="form-control"
                rows={3}
                value={value}
                onChange={(e) =>
                  updateField(f.apiField, e.target.value)
                }
              />
              {renderError(f.apiField)}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
