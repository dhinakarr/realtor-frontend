import React, { useEffect, useState, useRef } from "react";
import API from "../api/api";
import "./PlotViewPanel.css";
import { useReactToPrint } from "react-to-print";
import { FaPrint } from "react-icons/fa";
import logo from "../assets/logo.png";
import CancelBookingPanel from "./CancelBookingPanel"

export default function PlotViewPanel({ plotId, onClose, onBook, onCancel }) {
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);

  const printRef = useRef(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPlotId, setCancelPlotId] = useState(null);

  useEffect(() => {
	  if (!plotId) return;

	  setLoading(true);

	  API.get(`/api/plots/${plotId}`)
		.then((res) => {
		  if (res.data && res.data.success) {
			const apiData = res.data.data;

			setPlot({
			  ...apiData.plotData,
			  //ratePerSqft: apiData.ratePerSqft,
			  documentationCharges: apiData.documentationCharges,
			  otherCharges: apiData.otherCharges,
			});
		  } else {
			console.error("Unexpected response", res);
		  }
		})
		.catch((err) => {
		  console.error("Error loading plot:", err);
		})
		.finally(() => {
		  setLoading(false);
		});
	}, [plotId]); // ✅ IMPORTANT


  if (!plotId) return null;

  const labelMap = {
    plotNumber: "Plot Number",
    area: "Area",
	ratePerSqft: "Price per Sqft",
    basePrice: "Plot Price",
    surveyNum: "Survey Number",
    facing: "Facing",
	registrationCharges: "Registration Charges",
	documentationCharges: "Documentation Charges",
	otherCharges: "Other Charges",
    totalPrice: "Total Price",
    isPrime: "Prime Plot?",
    //status: "Status",
  };
  
  const handlePrint = useReactToPrint({
	  contentRef: printRef,   // ✅ NEW API
	  documentTitle: `Plot_${plot?.plotNumber || "Details"}`,
	});

	const canBook =
		  plot?.status === "AVAILABLE" &&
		  plot?.totalPrice != null &&
		  Number(plot.totalPrice) > 0;

  const handleCancelBooking = async () => {
	  try {
		await API.post(`/api/sales/${plotId}/cancel`, {
		  reason: cancelReason,
		  refundType: "FULL"
		});

		setShowCancelModal(false);
		onClose(); // close panel
		//refreshData(); // reload plots/sales
	  } catch (err) {
		alert("Failed to cancel booking");
	  }
	};


  return (
    <div className="plot-view-overlay">
      <div className="plot-view-panel">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Plot Details</h4>
		  <div className="d-flex gap-3">
			<button
			  className="btn btn-sm btn-outline-primary"
			  onClick={handlePrint}
			  title="Print / Save as PDF"
			  disabled={loading || !plot}
			>
			  <FaPrint />
			</button>
		  
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose}>✕</button>
         </div>
		</div>

        {loading && <p>Loading...</p>}
        {!loading && !plot && (
          <div className="alert alert-warning">No plot data found.</div>
        )}
		<div ref={printRef} className="print-container">
			{/* PRINT HEADER */}
		  <div className="print-header">
			  <div className="print-left">
				<img
				  src={logo}
				  alt="Company Logo"
				  width="50"
				  height="50"
				  className="print-logo"
				/>
				<div className="company-name">
				  <strong>Diamon Realty</strong>
				</div>
			  </div>

			  <div className="print-center">
				<h5>Plot Details</h5>
				<small>Generated on: {new Date().toLocaleDateString()}</small>
			  </div>
			</div>

  
        {!loading && plot && (
          <div className="plot-details-container">

            {Object.keys(labelMap).map((key) => {
			  // ⛔ hide Prime Plot row if value is false
			  if (key === "isPrime" && plot.isPrime !== true) {
				return null;
			  }

			  return (
				<div className="plot-detail-row" key={key}>
				  <div className="detail-label">{labelMap[key]}</div>
				  <div className="detail-value">
					{plot[key] === null || plot[key] === "" ? "-" : String(plot[key])}
				  </div>
				</div>
			  );
			})}

          </div>
        )}
</div>
        {/* Footer Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-secondary" onClick={onClose}>Back</button>
          <button
			  className="btn btn-success"
			  disabled={!canBook}
			  onClick={() => {
				if (!canBook) return;
				onClose();
				onBook(plotId, plot?.projectId);
			  }}
			>
			  Book
			</button>
			{plot?.status === "BOOKED" && (
			  <button
				className="btn btn-danger"
				onClick={() => onCancel(plotId)}
			  >
				Cancel Booking
			  </button>
			)}
        </div>
      </div>
	  
	  {cancelPlotId && (
		  <CancelBookingPanel
			plotId={cancelPlotId}
			onClose={() => setCancelPlotId(null)}
			onSuccess={refreshProjectDetails}
		  />
		)}


	  
    </div>
  );
}
