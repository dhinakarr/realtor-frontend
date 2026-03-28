import React, { useEffect, useState } from "react";
import API from "../api/api";
import { getFullUrl } from "../utils/mapApiToRoute";
import { useNavigate } from "react-router-dom";
//import "./HomePage.css";
import ProjectCards from "../components/projects/ProjectCards";

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);
  const navigate = useNavigate();
  const BASE_URL = API.defaults.baseURL;

  useEffect(() => {
    loadProjects();
  }, []);
  
  

  const loadProjects = async () => {
    try {
      const res = await API.get("/public/projects");
      if (res.data?.success) 
		  setProjects(res.data.data || []);
    } catch (err) {
      console.error("Error fetching public projects", err);
    } finally {
      setLoading(false);
    }
  };

  const openProject = (id) => navigate(`/public/projects/details/${id}`);

  return (
    <div className="container-fluid px-2">
      {loading && <p>Loading...</p>}

      {!loading && projects.length === 0 && (
        <p className="text-muted">No projects available</p>
      )}
	  {/*
      <div className="row">
        {projects.map((project) => {
          const img =
            project.files?.length > 0
              ? `${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`
              : null;

          return (
            <div key={project.projectId} className="col-md-4 mb-4">
              <div
                className="card shadow-sm h-100 position-relative cursor-pointer"
                onClick={() => openProject(project.projectId)}
              >
                {img && (
                  <img
                    src={img}
                    alt={project.projectName}
                    className="card-img-top"
                    style={{ height: "180px", objectFit: "cover" }}
                  />
                )}

                <div className="card-body">
                  <h5 className="fw-bold mb-1">{project.projectName}</h5>

                  <small className="text-muted">
                    {project.locationDetails}
                  </small>

                  <div className="mt-2 text-secondary">
                    Plots: {project.noOfPlots}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
	  
	  */}
	  
	  <ProjectCards
		  projects={projects}
		  BASE_URL={BASE_URL}
		  canEdit={false}   // 🔥 NO actions
		  canDelete={false}
		  onView={(id) => navigate(`/public/projects/details/${id}`)}
		  setActiveVideo={setActiveVideo}
		  setShowVideoModal={setShowVideoModal}
		/>
	  
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
