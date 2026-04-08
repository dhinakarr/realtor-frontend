import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./SaleInitiationPanel.css";
import { useToast } from "../components/common/ToastProvider";

export default function SaleInitiationPanel({ plotId, projectId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [plot, setPlot] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const { showToast } = useToast();
  const [projectHeads, setProjectHeads] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [projectAssociates, setProjectAssociates] = useState([]);

  const [selectedHead, setSelectedHead] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [selectedAssociate, setSelectedAssociate] = useState("");

  useEffect(() => {
    if (!plotId) return;

    setLoading(true);

    Promise.all([
      API.get(`/api/plots/${plotId}`),
      API.get(`/api/customers/hierarchy-visible`), // backend filters hierarchy
	  API.get(`/api/users/id-with-role?role=PH`)
    ])
      .then(([plotRes, custRes, userRes]) => {
        if (plotRes.data?.success) 
			setPlot(plotRes.data.data.plotData);
        if (custRes.data?.success) 
			setCustomers(custRes.data.data);
		if (userRes.data?.success) 
			setProjectHeads(userRes.data.data);
		
		//console.log("useEffect area: "+JSON.stringify(plot));
      })
	  .catch(err => console.error("Sale initiation load error:", err))
      .finally(() => setLoading(false));
  }, [plotId]);
  
  const handleHeadChange = (headId) => {
	  setSelectedHead(headId);
	  setSelectedManager("");
	  setSelectedAssociate("");
	  setProjectAssociates([]);

	  API.get(`/api/users/id-with-role?role=PM&managerId=${headId}`)
		.then(res => {
		  if (res.data?.success) {
			setProjectManagers(res.data.data);
		  }
		});
	};
	
	const handleManagerChange = (pmId) => {
	  setSelectedManager(pmId);
	  setSelectedAssociate("");

	  API.get(`/api/users/id-with-role?role=PA&managerId=${pmId}`)
		.then(res => {
		  if (res.data?.success) {
			setProjectAssociates(res.data.data);
		  }
		});
	};
	
	const handleAssociateChange = (id) => {
	  setSelectedAssociate(id);
	};
	
  const handleSubmit = () => {
	  if (!selectedCustomer) {
		showToast("Please select a Customer.", "danger");
		return;
	  }

	  if (!selectedHead) {
		showToast("Please select Project Head.", "danger");
		return;
	  }

	  if (!plot || !plot.area) {
		showToast("Plot area is missing. Cannot proceed with sale.", "danger");
		return;
	  }
	  // ✅ Seller logic
	  const soldBy = selectedAssociate || selectedManager || selectedHead;
	  const payload = {
		plotId,
		projectId,
		customerId: selectedCustomer,
		soldBy   // ✅ only ONE field now
	  };

	  API.post("/api/sales", payload)
		.then(res => {
		  showToast("Sale created successfully.", "success");
		  if(onSuccess) onSuccess(res.data.data);
		  onClose();
		})
		.catch(err => {
		  console.error("Sale creation failed:", err);
		  showToast("Failed to create sale.", "danger");
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

			
			<div className="sale-section mt-3">
			  <h6>Assign Sale Details</h6>

			  <div className="row g-2">

				{/* Project Head (Mandatory) */}
				<div className="col-md-6">
				  <label className="form-label">Project Head *</label>
				  <select
					className="form-select"
					value={selectedHead}
					onChange={(e) => handleHeadChange(e.target.value)}
				  >
					<option value="">-- Select Head --</option>
					{projectHeads.map(h => (
					  <option key={h.userId} value={h.userId}>
						{h.fullName}
					  </option>
					))}
				  </select>
				</div>

				{/* Project Manager (Optional) */}
				<div className="col-md-6">
				  <label className="form-label">Project Manager</label>
				  <select
					className="form-select"
					value={selectedManager}
					onChange={(e) => handleManagerChange(e.target.value)}
					disabled={!selectedHead}
				  >
					<option value="">-- Select Manager --</option>
					{projectManagers.map(pm => (
					  <option key={pm.userId} value={pm.userId}>
						{pm.fullName}
					  </option>
					))}
				  </select>
				</div>

				{/* Project Associate (Optional) */}
				<div className="col-md-6">
				  <label className="form-label">Project Associate</label>
				  <select
					className="form-select"
					value={selectedAssociate}
					onChange={(e) => handleAssociateChange(e.target.value)}
					disabled={!selectedManager}
				  >
					<option value="">-- Select Associate --</option>
					{projectAssociates.map(pa => (
					  <option key={pa.userId} value={pa.userId}>
						{pa.fullName}
					  </option>
					))}
				  </select>
				</div>

				{/* Customer (Mandatory) */}
				<div className="col-md-6">
				  <label className="form-label">Customer *</label>
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
				</div>

			  </div>
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
