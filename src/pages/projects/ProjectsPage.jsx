// src/pages/projects/ProjectListPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import useModule from "../../hooks/useModule";
import "./ProjectPage.css";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const featureUrl = "/api/projects";
  const module = useModule(featureUrl);
  
  const feature = module.features.find(f => f.url  === featureUrl);
  //console.log("ProjectsPage feature.canCreate: "+JSON.stringify(feature.canCreate));
  const BASE_URL = API.defaults.baseURL; 

  const storedUser = JSON.parse(localStorage.getItem("user"));
  
  const [deleteProjectId, setDeleteProjectId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreate = feature.canCreate;
  const canEdit   = feature.canUpdate;
  const canDelete = feature.canDelete;
  //console.log("ProjectsPage canCreate: "+canCreate+ " canEdit: "+canEdit+" canDelete: "+canDelete);
  
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Projects</h3>

        {canCreate && (
          <button
            className="btn btn-primary d-flex align-items-center"
            onClick={handleNewProject}
          >
            <FaPlus className="me-2" />
            New
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {!loading && projects.length === 0 && (
        <p className="text-muted">No Data to display</p>
      )}

      {/* Project Cards */}
      <div className="row">
        {projects.map((project) => {
          const img =
            project.files && project.files.length > 0
              ? `${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`
              : null;
//console.log("ProjectsPage project: "+img);
          return (
            <div
				  key={project.projectId}
				  className={`col-md-4 mb-4 project-card-wrapper ${project._fade ? "fade-out" : ""}`}
				>
              <div className="card shadow-sm h-100 position-relative cursor-pointer hover:shadow-lg"
                onClick={() => handleView(project.projectId)}>
			  
                {/* Edit Icon (top-right) */}
                {canEdit && (
                  <FaEdit
                    className="position-absolute"
                    style={{ top: "10px", right: "10px", cursor: "pointer" }}
                    onClick={(e) => {
						e.stopPropagation();
						handleEdit(project.projectId);
					  }
					}
                  />
                )}

                {/* Image */}
                {img && (
                  <img
                    src={img}
                    alt={project.projectName}
                    className="card-img-top"
                    style={{
                      height: "180px",
                      objectFit: "cover",
                      borderTopLeftRadius: "0.25rem",
                      borderTopRightRadius: "0.25rem",
                    }}
                  />
                )}

                <div className="card-body">
                  {/* Project Name */}
                  <h5 className="fw-bold mb-1">{project.projectName}</h5>
				  
				  <small className="text-muted">
                    {project.locationDetails} 
                  </small>
				  <p></p>
                  {/* Plot Number */}
                  <small className="text-muted">
                    Plots: {project.noOfPlots} (Start: {project.plotStartNumber})
                  </small>

                  {/* Location or survey number */}
                  <div className="mt-2 text-secondary">
                    Survey Number: <small>{project.surveyNumber}</small>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="card-footer bg-white position-relative" style={{ minHeight: "30px" }}>
				  {canDelete && (
					<FaTrash
					  className="text-danger position-absolute"
					  style={{
						right: "10px",
						bottom: "8px",
						cursor: "pointer",
						fontSize: "16px"
					  }}
					  onClick={(e) => {
							e.stopPropagation();
							handleDelete(project.projectId, e);
					    }
					  }
					/>
				  )}
				</div>

              </div>
            </div>
          );
        })}
      </div>
	  
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
	  
    </div>
  );
}
