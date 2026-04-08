// src/pages/projects/ProjectListPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import useModule from "../../hooks/useModule";
import "./ProjectPage.css";
import UploadDocumentOverlay from "./UploadDocumentOverlay";
import { FaUpload } from "react-icons/fa";
import ProjectCards from "../../components/projects/ProjectCards"
import ProjectPricingPanel from "../../components/projects/ProjectPricingPanel";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const featureUrl = "/api/projects";
  const module = useModule(featureUrl);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  
  const [showPricingPanel, setShowPricingPanel] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  const feature = module?.features?.find(f => f.url  === featureUrl);
  //console.log("ProjectsPage feature.canCreate: "+JSON.stringify(feature.canCreate));
  const BASE_URL = API.defaults.baseURL; 

  const storedUser = JSON.parse(localStorage.getItem("user"));
  
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreate = feature?.canCreate;
  const canEdit   = feature?.canUpdate;
  const canDelete = feature?.canDelete;
  //console.log("ProjectsPage canCreate: "+canCreate+ " canEdit: "+canEdit+" canDelete: "+canDelete);
  
  const handlePricing = (project) => {
	  setSelectedProject(project);
	  setShowPricingPanel(true);
	};
  
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try { 
      const res = await API.get("/api/projects");
	  //console.log("@ProjectPage.loadProjects res: "+JSON.stringify(res));
      if (res.data?.success) {
        setProjects(res.data.data || []);
      }
	  //console.log("@ProjectPage.loadProjects projects: "+JSON.stringify(projects));
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
	
  };
  
  const overallInventory = projects.reduce(
	  (acc, p) => {
		acc.total += p.totalPlots || 0;
		acc.available += p.availablePlots || 0;
		acc.booked += p.bookedPlots || 0;
		acc.sold += p.soldPlots || 0;
		return acc;
	  },
	  { total: 0, available: 0, booked: 0, sold: 0 }
	);
  
  const handleNewProject = () => navigate("/projects/create");

  const handleEdit = (id) => navigate(`/projects/edit/${id}`);
  const handleView = (id) => navigate(`/projects/details/${id}`);
  const handleDelete = (id, e) => {
	  e.stopPropagation();
	  setDeleteProjectId(id);
	};
  
  const cancelProject = async (projectId) => {
	  setIsDeleting(true);

	  try {
		const res = await API.delete(`/api/projects/${projectId}`);
		if (res.data.success) {
		  // fade-out animation flag
		  setProjects(prev =>
			prev.map(p =>
			  p.projectId === projectId ? { ...p, _fade: true } : p
			)
		  );

		  // remove after animation ends (300ms)
		  setTimeout(() => {
			setProjects(prev => prev.filter(p => p.projectId !== projectId));
		  }, 300);

		  toast.success("Project deleted successfully!");
		}
	  } catch (err) {
		console.error(err);
	  }

	  setIsDeleting(false);
	  setDeleteProjectId(null);
	};

  return (
    <div className="container-fluid  custom-container">

      {/* Header */}
	   <div className="projects-header-fix d-flex align-items-center">

		  {/* LEFT */}
		  <h4 className="projects-title mb-0">Projects</h4>

		  {/* CENTER (always centered) */}
		  <div className="mx-auto d-flex gap-2 inventory-inline-cards">

			<div className="inv-card total">
			  <div className="inv-value">{overallInventory.total}</div>
			  <div className="inv-label">Total</div>
			</div>

			<div className="inv-card available">
			  <div className="inv-value">{overallInventory.available}</div>
			  <div className="inv-label">Available</div>
			</div>

			<div className="inv-card booked">
			  <div className="inv-value">{overallInventory.booked}</div>
			  <div className="inv-label">Booked</div>
			</div>

			<div className="inv-card sold">
			  <div className="inv-value">{overallInventory.sold}</div>
			  <div className="inv-label">Sold</div>
			</div>

		  </div>

		  {/* RIGHT */}
		  <div className="ms-auto">
			{canCreate && (
			  <button
				className="btn btn-primary projects-btn-fix"
				onClick={handleNewProject}
			  >
				<FaPlus className="me-2" />
				New Project
			  </button>
			)}
		  </div>

		</div>
	<p />

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {!loading && projects.length === 0 && (
        <p className="text-muted">No Data to display</p>
      )}

      {/* Project Cards */}
	  <ProjectCards
		  projects={projects}
		  BASE_URL={BASE_URL}
		  canEdit={canEdit}
		  canDelete={canDelete}
		  onView={handleView}
		  onEdit={handleEdit}
		  onDelete={handleDelete}
		  onUpload={(id) => {
			setSelectedProjectId(id);
			setShowUploadOverlay(true);
		  }}
		  setActiveVideo={setActiveVideo}
		  setShowVideoModal={setShowVideoModal}
		  onPricing={handlePricing}
		/>
		
		<UploadDocumentOverlay
		  show={showUploadOverlay}
		  projectId={selectedProjectId}
		  onClose={() => setShowUploadOverlay(false)}
		  onSuccess={() => {
			setShowUploadOverlay(false);
			loadProjects(); // ✅ THIS is what you're missing
		  }}
		/>
		
		<ProjectPricingPanel
		  show={showPricingPanel}
		  project={selectedProject}
		  onClose={() => setShowPricingPanel(false)}
		  onSuccess={loadProjects}
		/>
		
	  {/* DELETE PROJECT CONFIRM MODAL */}
		{deleteProjectId && (
		  <div
			className="modal fade show"
			style={{ display: "block", background: "rgba(0,0,0,0.4)" }}
		  >
			<div className="modal-dialog modal-dialog-centered">
			  <div className="modal-content">

				<div className="modal-header">
				  <h5 className="modal-title">Delete Project</h5>
				  <button className="btn-close" onClick={() => setDeleteProjectId(null)} />
				</div>

				<div className="modal-body">
				  Are you sure you want to <strong>delete this project?</strong><br/>
				  This will mark the project as <strong>INACTIVE</strong>.
				</div>

				<div className="modal-footer">
				  <button className="btn btn-secondary" onClick={() => setDeleteProjectId(null)}>
					Cancel
				  </button>

				  <button className="btn btn-danger" disabled={isDeleting}
					onClick={() => 
						cancelProject(deleteProjectId)
					}>
					{isDeleting ? "Deleting..." : "Yes, Delete"}
				  </button>
				</div>

			  </div>
			</div>
		  </div>
		)}

		{/* PLAYING VIDEO MODAL */}
		{showVideoModal && activeVideo && (
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
				  <h5 className="modal-title">Project Video</h5>
				  <button
					className="btn-close"
					onClick={() => setShowVideoModal(false)}
				  />
				</div>

				<div className="modal-body p-0">
				  <video
					src={`${BASE_URL}${activeVideo.filePath}`}
					controls
					autoPlay
					style={{ width: "100%", maxHeight: "70vh" }}
				  />
				</div>

			  </div>
			</div>
		  </div>
		)}
    </div>
  );
}
