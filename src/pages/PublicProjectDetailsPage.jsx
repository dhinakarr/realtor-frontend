import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./PublicProjectDetailsPage.css";
import ProjectDetailsContent from "../components/projects/ProjectDetailsContent";
import PlotViewPanel from "../components/PlotViewPanel";

export default function PublicProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const BASE_URL = API.defaults.baseURL;
  const [viewPlotId, setViewPlotId] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    API.get(`/public/projects/details/${id}`)
      .then((res) => {
        if (res.data.success) {
			setProjectData(res.data.data);
		}
      })
      .catch(console.error);
  }, [id]);

  const openPlotOverlay = (plotId) => {
    API.get(`/public/plots/${plotId}`)
      .then((res) => {
        if (res.data.success) {
			setSelectedPlot({
			  ...res.data.data.plotData,
			  documentationCharges: res.data.data.documentationCharges,
			  otherCharges: res.data.data.otherCharges
			});
			setViewPlotId(plotId);
		}
      })
	  
      .catch(console.error);
  };

  const closeOverlay = () => setSelectedPlot(null);

  if (!projectData)
    return <div style={{ padding: "20px" }}>Loading...</div>;

  const { project, plots } = projectData;

  const getPlotColor = (status) => {
    switch (status) {
      case "AVAILABLE": return "white";
      case "BOOKED": return "yellow";
      case "SOLD": return "lightgreen";
      case "CANCELLED": return "lightgray";
      default: return "white";
    }
  };

  return (
    <div className="container-fluid px-2 position-relative">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>{project.projectName}</h3>
        <button className="btn btn-secondary" onClick={() => navigate("/")}>Back</button>
      </div>

      <ProjectDetailsContent
		  projectData={projectData}
		  plots={plots || []}
		  BASE_URL={BASE_URL}

		  // PUBLIC → only view, no edit/delete
		  onPlotClick={openPlotOverlay}

		  // ❌ No actions
		  renderPlotActions={() => ({})}

		  // ✅ Gallery click handling
		  onMediaClick={(doc, type) => {
			setActiveMedia(doc);
			if (type === "IMAGE") setShowImageModal(true);
			if (type === "VIDEO") setShowVideoModal(true);
		  }}
		/>

		{showImageModal && activeMedia && (
		  <div
			style={{
			  position: "fixed",
			  inset: 0,
			  background: "rgba(0,0,0,0.85)",
			  zIndex: 1050,
			  display: "flex",
			  alignItems: "center",
			  justifyContent: "center",
			}}
			onClick={() => setShowImageModal(false)}
		  >
			<div
			  style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}
			  onClick={(e) => e.stopPropagation()}
			>
			  <button
				onClick={() => setShowImageModal(false)}
				style={{
				  position: "absolute",
				  top: "-10px",
				  right: "-10px",
				  background: "white",
				  borderRadius: "50%",
				  width: "30px",
				  height: "30px",
				  border: "none",
				}}
			  >
				×
			  </button>

			  <img
				src={`${BASE_URL}${activeMedia.filePath}`}
				style={{ maxWidth: "100%", maxHeight: "100%" }}
			  />
			</div>
		  </div>
		)}
		
		{showVideoModal && activeMedia && (
			  <div
				className="modal fade show"
				style={{ display: "block", background: "rgba(0,0,0,0.6)" }}
				onClick={() => setShowVideoModal(false)}
			  >
				<div
				  className="modal-dialog modal-lg modal-dialog-centered"
				  onClick={(e) => e.stopPropagation()}
				>
				  <div className="modal-content">
					<div className="modal-header">
					  <h5>Project Video</h5>
					  <button className="btn-close" onClick={() => setShowVideoModal(false)} />
					</div>

					<div className="modal-body p-0">
					  <video
						src={`${BASE_URL}${activeMedia.filePath}`}
						controls
						autoPlay
						style={{ width: "100%", maxHeight: "70vh" }}
					  />
					</div>
				  </div>
				</div>
			  </div>
			)}

		{/* Sliding Overlay */}
			
			{viewPlotId && (
				<PlotViewPanel
				  plotId={viewPlotId}
				  plotData={selectedPlot}
				  onClose={() => setViewPlotId(null)}
				  onBook={null}
				  onCancel={(plotId) => {
					  setViewPlotId(null);      // close plot view
					  setCancelPlotId(plotId);  // open cancel panel
					}}
				/>
			  )}
    </div>
  );
}
