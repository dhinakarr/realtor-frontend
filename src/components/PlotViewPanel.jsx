import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./PlotViewPanel.css";

export default function PlotViewPanel({ plotId, onClose, onBook }) {
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salePlotId, setSalePlotId] = useState(null);
  

  useEffect(() => {
    if (!plotId) return;
	setSalePlotId(plotId);
    setLoading(true);
    API.get(`/api/plots/${plotId}`)
      .then((res) => {
        if (res.data && res.data.success) {
          setPlot(res.data.data);
        } else {
          console.error("Unexpected response", res);
        }
      })
      .catch((err) => console.error("Error loading plot:", err))
      .finally(() => setLoading(false));
  }, [plotId]);

  if (!plotId) return null;

  const labelMap = {
    plotNumber: "Plot Number",
    area: "Area",
    basePrice: "Base Price",
    surveyNum: "Survey Number",
    facing: "Facing",
    totalPrice: "Total Price",
    isPrime: "Prime Plot?",
    status: "Status",
  };

  return (
    <div className="plot-view-overlay">
      <div className="plot-view-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Plot Details</h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>✕</button>
        </div>

        {loading && <p>Loading...</p>}
        {!loading && !plot && (
          <div className="alert alert-warning">No plot data found.</div>
        )}

        {!loading && plot && (
          <div className="plot-details-container">

            {Object.keys(labelMap).map((key) => (
              <div className="plot-detail-row" key={key}>
                <div className="detail-label">{labelMap[key]}</div>
                <div className="detail-value">
                  {plot[key] === null || plot[key] === "" ? "-" : String(plot[key])}
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Footer Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={onClose}>Back</button>
          <button
			  className="btn btn-success"
			  disabled={plot?.status !== "AVAILABLE"}
			  onClick={() => {
				if (plot?.status !== "AVAILABLE") return;
				onClose();
				onBook(plotId, plot?.projectId);
			  }}
			>
			  Book
			</button>
        </div>
      </div>
    </div>
  );
}
