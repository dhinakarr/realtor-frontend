import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./SaleInitiationPanel.css";

export default function SaleInitiationPanel({ plotId, projectId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [plot, setPlot] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  useEffect(() => {
    if (!plotId) return;

    setLoading(true);

    Promise.all([
      API.get(`/api/plots/${plotId}`),
      API.get(`/api/customers/hierarchy-visible`) // backend filters hierarchy
    ])
      .then(([plotRes, custRes]) => {
        if (plotRes.data?.success) 
			setPlot(plotRes.data.data.plotData);
        if (custRes.data?.success) 
			setCustomers(custRes.data.data);
		
		//console.log("useEffect area: "+JSON.stringify(plot));
      })
	  
      .catch(err => console.error("Sale initiation load error:", err))
      .finally(() => setLoading(false));
  }, [plotId]);

  const handleSubmit = () => {
	  
	if (!selectedCustomer) {
	  alert("Please select a customer.");
	  return;
    }
	
	if (!plot || !plot.area) {
		alert("Plot area is missing. Cannot proceed with sale.");
		return;
	  }
	//console.log("handleSubmit area: "+plot.area);
    const payload = {
      plotId,
      projectId,
      customerId: selectedCustomer
    };

    API.post("/api/sales", payload)
      .then(res => {
        alert("Sale created successfully.");
        if(onSuccess) onSuccess(res.data.data);
		onClose();
      })
      .catch(err => {
        console.error("Sale creation failed:", err);
        alert("Failed to create sale.");
      });
  };

  return (
    <div className="sale-overlay">
      <div className="sale-panel">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Initiate Sale</h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        {loading && <p>Loading...</p>}

        {!loading && plot && (
          <>
            {/* Plot Summary */}
            <div className="sale-section">
              <h6>Plot Information</h6>
              <div><strong>Plot No:</strong> {plot.plotNumber}</div>
              <div><strong>Area:</strong> {plot.width}×{plot.breath} = {plot.area} sqft</div>
              <div><strong>Facing:</strong> {plot.facing}</div>
              <div><strong>Status:</strong> {plot.status}</div>
            </div>

            {/* Customer Selection */}
            <div className="sale-section mt-3">
              <h6>Select Customer</h6>

              <select
                className="form-select"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">-- Select Customer --</option>
                {customers.map(c => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.customerName} — {c.mobile}
                  </option>
                ))}
              </select>
			  {/*
              
              <button
                className="btn btn-sm btn-primary mt-2"
                onClick={() => window.location.href = `/customers/create?plotId=${plotId}`}
              >
                + Add New Customer
              </button>
		*/}
            </div>

            {/* Footer */}
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={onClose}>Back</button>

              <button type="button" className="btn btn-success" onClick={handleSubmit}>
                Proceed to Sale
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
