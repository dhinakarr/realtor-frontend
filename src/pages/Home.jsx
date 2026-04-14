import React, { useEffect, useState, useRef } from "react";
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
  const hasFetched = useRef(false);
  
  useEffect(() => {
console.log(API.defaults.baseURL);
    loadProjects();
  }, []);
  
  

  const loadProjects = async () => {
	  
    try {
      const res = await API.get("/api/public/projects");
      if (res.data?.success) 
		  setProjects(res.data.data || []);
    } catch (err) {
      console.error("Error fetching public projects", err);
    } finally {
      setLoading(false);
    }
  };

  const openProject = (id) => navigate(`/public/projects/details/${id}`);
console.log("Projects size: "+projects.length);
  return (
    <div className="container-fluid px-2">
      {loading && <p>Loading...</p>}

      {!loading && projects.length === 0 && (
        <p className="text-muted">No projects available</p>
      )}
	  	  
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
