import React, { useState, useEffect } from "react";
import API from "../../api/api";
import { useToast } from "../../components/common/ToastProvider";

export default function ProjectPricingPanel({
  show,
  project,
  onClose,
  onSuccess
}) {
  const [guidanceValue, setGuidanceValue] = useState("");
  const [pricePerSqft, setPricePerSqft] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (project) {
      setGuidanceValue(project.guidanceValue || "");
      setPricePerSqft(project.pricePerSqft || "");
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!guidanceValue && !pricePerSqft) {
      showToast("No changes to update", "success");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        guidanceValue: guidanceValue || null,
        pricePerSqft: pricePerSqft || null
      };

      const res = await API.patch(
        `/api/projects/${project.projectId}/pricing`,
        payload
      );

      if (res.data?.success) {
        showToast("Pricing updated successfully ✅", "success");
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update pricing ❌", "danger");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="slideover-backdrop">
      <div className="slideover-panel">

        <div className="slideover-header d-flex justify-content-between align-items-center">
          <h5>Update Pricing</h5>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="slideover-body">

          <div className="mb-3">
            <label>Guidance Value</label>
            <input
              type="number"
              className="form-control"
              value={guidanceValue}
              onChange={(e) => setGuidanceValue(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Price per Sqft</label>
            <input
              type="number"
              className="form-control"
              value={pricePerSqft}
              onChange={(e) => setPricePerSqft(e.target.value)}
            />
          </div>

        </div>

        <div className="slideover-footer d-flex justify-content-end gap-2">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Submit"}
          </button>
        </div>

      </div>
    </div>
  );
}