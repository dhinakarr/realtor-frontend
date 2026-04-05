import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaMoneyBill } from "react-icons/fa";
import API from "../../api/api";
import "./ProjectDetailsPage.css";
import PlotStatusDonut from "./PlotStatusDonut";
import useModule from "../../hooks/useModule";
import PlotEditPanel from "../../components/PlotEditPanel";
import PlotViewPanel from "../../components/PlotViewPanel";
import ChartMount from "../../components/ChartMount";
import { formatINRComma, formatINR } from "../../utils/numberFormatter";

import SaleInitiationPanel from "../../components/SaleInitiationPanel";
import PaymentModal from "../../components/PaymentModal";
import CancelBookingPanel from "../../components/CancelBookingPanel";
import ProjectDetailsContent from "../../components/projects/ProjectDetailsContent";

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [editPlotId, setEditPlotId] = useState(null);
  const [viewPlotId, setViewPlotId] = useState(null);
  const [deletePlotId, setDeletePlotId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [salePlotId, setSalePlotId] = useState(null);
  const [saleProjectId, setSaleProjectId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [cancelPlotId, setCancelPlotId] = useState(null);
  const [activeMedia, setActiveMedia] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const BASE_URL = API.defaults.baseURL;

  const featureUrl = "/api/plots";
  const module = useModule(featureUrl);
  const feature = module?.features?.find(f => f.url);

  const canCreate = feature?.canCreate;
  const canEdit   = feature?.canUpdate;
  const canDelete = feature?.canDelete;
  const isFinance = (feature?.financeRole == "FINANCE") ? true : false;
  
  const projectsUrl = "/api/projects";
  const projectsModule = useModule(projectsUrl);
  const projs = projectsModule?.features?.find(p => p.url === projectsUrl);
  const pCreate = projs?.canCreate ?? false;
  const pEdit = projs?.canUpdate ?? false;
  
  const rulesUrl = "/api/commission-rules";
  const rulesModule = useModule(rulesUrl);
  const rules = rulesModule?.features?.find(r => r.url === rulesUrl);
  const rCreate = rules?.canCreate ?? false;
  
  const loadProject = () => {
    API.get(`/api/projects/details/${id}`)
      .then((res) => {
        if (res.data.success) setProjectData(res.data.data);
      })
      .catch(console.error);
  };

  const openViewPanel = (id) => {
    API.get(`/api/plots/${id}`).then(res => {
      if (res.data.success) {
        setViewPlotId(id);
      }
    }).catch(console.error);
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  if (!projectData) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Loading...</div>;
  }
  
  const plotStatData = projectData?.stat
  ? [
      { name: "Available", count: projectData.stat.available },
      { name: "Booked", count: projectData.stat.booked },
      { name: "Sold", count: projectData.stat.sold },
      { name: "Cancelled", count: projectData.stat.cancelled }
    ]
  : [];


  const { project, plots } = projectData;

  const getPlotColor = (status) => {
    switch (status) {
      case "AVAILABLE": return "lightblue";
      case "BOOKED": return "yellow";
      case "SOLD": return "green";
      case "CANCELLED": return "grey";
      default: return "#ffffff";
    }
  };
  
  const galleryImages = project.documents?.filter(d => d.documentType === "IMAGE") || [];
  const galleryVideos = project.documents?.filter(d => d.documentType === "VIDEO") || [];

  //console.log("documents", JSON.stringify(project.documents));

  const cancelPlot = (plotId) => {
    //if (!window.confirm("Are you sure you want to cancel this plot?")) return;
    
    setIsDeleting(true);
    API.delete(`/api/plots/${plotId}`)
      .then((res) => {
        if (res.data.success) {
          setProjectData(prev => ({
            ...prev,
            plots: prev.plots.map(p =>
              p.plotId === plotId
                ? { ...p, status: "CANCELLED", _animate: true }
                : p
            )
          }));
          setTimeout(() => {
            setProjectData(prev => ({
              ...prev,
              plots: prev.plots.map(p =>
                p.plotId === plotId ? { ...p, _animate: false } : p
              )
            }));
          }, 1000);
        }
      })
      .finally(() => {
        setIsDeleting(false);
        setDeletePlotId(null);
      })
      .catch(console.error);
  };
  
  const handleSaleInitiation = (plotId, projectId) => {
	  setSalePlotId(plotId);
	  setSaleProjectId(projectId);
	};
	
  const refreshProjectDetails = () => {
    loadProject();   // This reloads full project details safely
  };
  
  const handlePaymentSubmit = async (payload) => {
	  try {
		await API.post("/api/payments", payload);
		
		setShowPaymentModal(false);
		toast.success("Payment saved successfully");
		// optionally refresh payments list
	  } catch (err) {
		toast.error("Failed to save payment");
	  }
	};
	
  return (
    <div className="project-details-container">
      {/* HEADER */}
 
		<div className="project-header">
		  <h4 style={{ margin: 0 }}>Project Details</h4>

		  <div className="project-header-actions">
			<button
			  type="button"
			  className="btn btn-primary"
			  onClick={() => navigate(-1)}
			>
			  Back
			</button>
			{rCreate && (
			<button
			  type="button"
			  className="btn btn-primary"
			  onClick={() => navigate(`/projects/${id}/commission-rules`)}
			>
			  Payout Rules
			</button>
			)}
			{pCreate && (
			<button
			  type="button"
			  className="btn btn-primary"
			  onClick={() => navigate("/projects/create")}
			>
			  + New Project
			</button>
			)}
		  </div>
		</div>
		
      {/* PROJECT INFO */}
	  <ProjectDetailsContent
		  projectData={projectData}
		  plots={plots}
		  BASE_URL={BASE_URL}
		  onPlotClick={openViewPanel}
		  pCreate={pCreate}
		  canEdit={canEdit}
		  canDelete={canDelete}
		  // 🔥 Inject EDIT / DELETE UI ONLY HERE
		  renderPlotActions={(plot) => ({
			  edit: canEdit && (
				<FaEdit
				  className="plot-edit-icon"
				  onClick={(e) => {
					e.stopPropagation();
					setEditPlotId(plot.plotId);
				  }}
				/>
			  ),

			  bottom: canDelete && (
				<FaTrash
				  className="plot-icon delete"
				  size={20}
				  onClick={(e) => {
					e.stopPropagation();
					setDeletePlotId(plot.plotId);
				  }}
				/>
			  )
			})}
		  
		  onMediaClick={(doc, type) => {
			setActiveMedia(doc);
			if (type === "IMAGE") setShowImageModal(true);
			if (type === "VIDEO") setShowVideoModal(true);
		  }}
		/>

		{salePlotId && (
		  <SaleInitiationPanel
			plotId={salePlotId}
			projectId={saleProjectId}
			onClose={() => {
				setSalePlotId(null);
				setSaleProjectId(null);
			}}
			onSuccess={() => {
			  refreshProjectDetails();

			  setSalePlotId(null);
			  setSaleProjectId(null);
			  setViewPlotId(null); // 🔥 key fix
			}}
		  />
		)}
		
		
		
		<PaymentModal
		  open={showPaymentModal}
		  plotId={selectedSale}
		  onClose={() => setShowPaymentModal(false)}
		  onSubmit={handlePaymentSubmit}
		/>

      {/* Panels & Modals */}
      {editPlotId && (
        <PlotEditPanel
          plotId={editPlotId}
          onClose={() => setEditPlotId(null)}
          onSaved={loadProject}
        />
      )}
	  
	  {/* PLAYING VIDEO MODAL */}
		{showVideoModal && activeMedia && (
		  <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.6)" }}
			   onClick={() => setShowVideoModal(false)}>

			<div className="modal-dialog modal-lg modal-dialog-centered"
				 onClick={e => e.stopPropagation()}>

			  <div className="modal-content">
				<div className="modal-header">
				  <h5 className="modal-title">Project Video</h5>
				  <button className="btn-close" onClick={() => setShowVideoModal(false)} />
				</div>

				<div className="modal-body p-0">
				  <video
					key={activeMedia.documentId}   // <-- this forces React to recreate the video element
					src={`${BASE_URL}${activeMedia.filePath}`}
					controls
					autoPlay
					playsInline
					preload="metadata"
					style={{ width: "100%", maxHeight: "70vh" }}
				  />
				</div>
			  </div>

			</div>
		  </div>
		)}


		{/* SHOWING IMAGE MODAL */}
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
			onClick={() => setShowImageModal(false)} // click outside closes
		  >
			<div
			  style={{
				position: "relative",
				maxWidth: "90%",
				maxHeight: "90%",
			  }}
			  onClick={(e) => e.stopPropagation()} // clicks on image itself don’t close
			>
			  {/* Close Button */}
			  <button
				onClick={() => setShowImageModal(false)}
				style={{
				  position: "absolute",
				  top: "-10px",
				  right: "-10px",
				  background: "white",
				  border: "none",
				  borderRadius: "50%",
				  width: "30px",
				  height: "30px",
				  cursor: "pointer",
				  fontWeight: "bold",
				  zIndex: 10,
				}}
			  >
				×
			  </button>

			  <img
				src={`${BASE_URL}${activeMedia.filePath}`}
				alt=""
				style={{
				  maxWidth: "100%",
				  maxHeight: "100%",
				  objectFit: "contain",
				  display: "block",
				}}
			  />
			</div>
		  </div>
		)}

      {viewPlotId && (
	  
	  
	  
        <PlotViewPanel
          plotId={viewPlotId}
          onClose={() => setViewPlotId(null)}
		  onBook={handleSaleInitiation}
		  onCancel={(plotId) => {
			  setViewPlotId(null);      // close plot view
			  setCancelPlotId(plotId);  // open cancel panel
			}}
        />
      )}
	  
	  {cancelPlotId && (
		  <CancelBookingPanel
			plotId={cancelPlotId}
			onClose={() => setCancelPlotId(null)}
			onSuccess={refreshProjectDetails}
		  />
		)}

      {deletePlotId && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cancel Plot</h5>
                <button type="button" className="btn-close" onClick={() => setDeletePlotId(null)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to <strong>cancel</strong> this plot?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setDeletePlotId(null)}>
                  Close
                </button>
                <button className="btn btn-danger" disabled={isDeleting} onClick={() => cancelPlot(deletePlotId)}>
                  {isDeleting ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}