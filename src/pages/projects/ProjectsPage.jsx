// src/pages/projects/ProjectListPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../api/api";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import useModule from "../../hooks/useModule";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const featureUrl = "/api/projects";
  const module = useModule(featureUrl);
  
  const feature = module.features.find(f => f.url);
  //console.log("ProjectsPage feature.canCreate: "+JSON.stringify(feature.canCreate));
  const BASE_URL = API.defaults.baseURL; 

  const storedUser = JSON.parse(localStorage.getItem("user"));

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
      if (res.data?.success) {
        setProjects(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewProject = () => navigate("/projects/create");

  const handleEdit = (id) => navigate(`/projects/edit/${id}`);
  const handleDelete = (id) => {
    if (!window.confirm("Are you sure to delete this project?")) return;
    console.log("Delete ->", id);
  };

  return (
    <div className="container">

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
              ? project.files[0].publicUrl
              : null;
//console.log("ProjectsPage project: "+project.files[0].publicUrl);
          return (
            <div key={project.projectId} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 position-relative">
                {/* Edit Icon (top-right) */}
                {canEdit && (
                  <FaEdit
                    className="position-absolute"
                    style={{ top: "10px", right: "10px", cursor: "pointer" }}
                    onClick={() => handleEdit(project.projectId)}
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
                <div className="card-footer d-flex justify-content-between align-items-center bg-white">
                  <Link
                    to={`/admin/projects/${project.projectId}`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    View
                  </Link>

                  {/* Delete Icon */}
                  {canDelete && (
                    <FaTrash
                      className="text-danger"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(project.projectId)}
                    />
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
