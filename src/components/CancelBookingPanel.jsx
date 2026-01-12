import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./CancelBookingPanel.css";

export default function CancelBookingPanel({
  plotId,
  onClose,
  onSuccess
}) {
  const [plot, setPlot] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!plotId) return;

    API.get(`/api/plots/${plotId}`)
      .then(res => {
        if (res.data.success) {
          setPlot(res.data.data.plotData);
        }
      })
      .finally(() => setLoading(false));
  }, [plotId]);

  const handleCancel = async () => {
    if (!reason.trim()) return;
console.log("handleCancel plotId: "+plotId);
    try {
      setSubmitting(true);
      await API.post(`/api/sales/${plotId}/cancel`, {
        reason,
        refundType: "FULL"
      });

      onSuccess?.();
      onClose();
    } catch {
      alert("Failed to cancel booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (!plotId) return null;

  return (
    <div className="cancel-booking-overlay">
      <div className="cancel-booking-panel">
        <div className="panel-header">
          <h4>Cancel Booking</h4>
          <button className="btn-close" onClick={onClose} />
        </div>

        {loading && <p>Loading...</p>}

        {!loading && plot && (
          <>
            <div className="panel-body">
              <p>
                You are cancelling booking for
                <strong> Plot {plot.plotNumber}</strong>
              </p>

              <textarea
                className="form-control"
                placeholder="Reason for cancellation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="panel-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Back
              </button>

              <button
                className="btn btn-danger"
                disabled={!reason || submitting}
                onClick={handleCancel}
              >
                {submitting ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
