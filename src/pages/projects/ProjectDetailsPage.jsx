import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaMoneyBill } from "react-icons/fa";
import API from "../../api/api";
import "./ProjectDetailsPage.css";
import useModule from "../../hooks/useModule";
import PlotEditPanel from "../../components/PlotEditPanel";
import PlotViewPanel from "../../components/PlotViewPanel";
import SaleInitiationPanel from "../../components/SaleInitiationPanel";
import PaymentModal from "../../components/PaymentModal";

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

  const BASE_URL = API.defaults.baseURL;
  
  const featureUrl = "/api/plots";
  const module = useModule(featureUrl);
  //console.log("ProjectDetailsPage module: "+JSON.stringify(module));
  const feature = module.features.find(f => f.url);
  //console.log("ProjectsPage feature.canCreate: "+JSON.stringify(feature.canCreate));
  const canCreate = feature.canCreate;
  const canEdit   = feature.canUpdate;
  const canDelete = feature.canDelete;

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

  const { project, plots } = projectData;

  const getPlotColor = (status) => {
    switch (status) {
      case "AVAILABLE": return "#ffffff";
      case "BOOKED": return "yellow";
      case "SOLD": return "green";
      case "CANCELLED": return "grey";
      default: return "#ffffff";
    }
  };

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
		  <h1 style={{ margin: 0 }}>Project Details</h1>

		  <div className="project-header-actions">
			<button
			  type="button"
			  className="btn btn-primary"
			  onClick={() => navigate("/projects/list")}
			>
			  Back
			</button>

			<button
			  type="button"
			  className="btn btn-primary"
			  onClick={() => navigate(`/projects/${id}/commission-rules`)}
			>
			  Commission Rules
			</button>

			<button
			  type="button"
			  className="btn btn-primary"
			  onClick={() => navigate("/projects/create")}
			>
			  + New Project
			</button>
		  </div>
		</div>
      {/* PROJECT INFO */}
      <div className="project-card" style={{ marginBottom: "20px", padding: "15px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#f9f9f9" }}>
        {project.files?.length > 0 && (
          <img
            src={`${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`}
            alt={project.projectName}
            style={{ width: "100%", borderRadius: "8px", marginBottom: "15px", height:"450px" }}
          />
        )}
        <h4 style={{ margin: "0 0 10px" }}>{project.projectName}</h4>
		<table className="table table-transparent">
		  <tbody>
			<tr>
			  <td style={{ width: "40%" }}>
				<p><small>Location:</small> {project.locationDetails}</p>
				<p><small>Survey Number:</small> {project.surveyNumber}</p>
				<p><small>Start Date:</small> {project.startDate}</p>
				<p><small>End Date:</small> {project.endDate}</p>
				<p><small>Price / Sqft:</small> ₹{project.pricePerSqft}</p>
			  </td>
			  <td style={{ width: "40%" }}>
				<p><small>Registration Charges:</small> ₹{project.regCharges}</p>
				<p><small>Documentation Charges:</small> ₹{project.docCharges}</p>
				<p><small>Other Charges:</small> ₹{project.otherCharges}</p>
				<p><small>Guideline Value:</small> ₹{project.guidanceValue}</p>
			  </td>
			</tr>
		  </tbody>
		</table>

      </div>

      {/* PLOT GRID */}
			  <div className="project-grid">
				  {plots.map((plot) => (
					<div
					  key={plot.plotId}
					  className={`plot-square ${plot._animate ? "fade-anim" : ""}`}
					  style={{ backgroundColor: getPlotColor(plot.status) }}
					  onClick={() => openViewPanel(plot.plotId)}
					>
					  <div className="plot-content-wrapper">
						<div className="plot-number">Plot {plot.plotNumber}</div>

						<div className="plot-data">
						  <div>Area: {plot.area} sft</div>
						  <div>Facing: {plot.facing || ""}</div>
						  <div>Survey: {plot.surveyNum}</div>
						  <div>Total: {plot.totalPrice}</div>
						</div>

						{/* Edit Icon */}
					{canEdit && (	
						<FaEdit
						  className="plot-edit-icon"
						  onClick={(e) => {
							e.stopPropagation();
							setEditPlotId(plot.plotId);
						  }}
						/>
					)}
						{/* Bottom Icons */}

						{plot.status !== "CANCELLED" && (
						  <div className="bottom-icons">
						  {canEdit && (
							<FaMoneyBill
							  className="plot-icon finance"
							  size={24}
							  onClick={(e) => {
								e.stopPropagation();
								setSelectedSale(plot.plotId);
								setShowPaymentModal(true);
							  }}
							/>
						  )}
						  {canDelete && (
							<FaTrash
							  className="plot-icon delete"
							  size={20}
							  onClick={(e) => {
								e.stopPropagation();
								setDeletePlotId(plot.plotId);
							  }}
							/>
							)}
							
						  </div>
						)}

					  </div>
					</div>
				  ))}
				  
				  
				  {/* Project Images Gallery */}
					{project.files?.length > 1 && (
					  <div className="project-images-gallery mt-3">
						{project.files.slice(1).map((file, index) => (
						  <img
							key={file.projectFileId}
							src={`${BASE_URL}/api/projects/file/${file.projectFileId}`}
							alt={`${project.projectName} - ${index + 2}`}
							className="project-gallery-img"
						  />
						))}
					  </div>
					)}

				  
				</div>

		{salePlotId && (
		  <SaleInitiationPanel
			plotId={salePlotId}
			projectId={saleProjectId}
			onClose={() => {
				setSalePlotId(null);
				setSaleProjectId(null);
			}}
			onSuccess={refreshProjectDetails}
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

      {viewPlotId && (
        <PlotViewPanel
          plotId={viewPlotId}
          onClose={() => setViewPlotId(null)}
		  onBook={handleSaleInitiation}
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