import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
//import "./HomePage.css";

export default function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const BASE_URL = API.defaults.baseURL;

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await API.get("/public/projects");
      if (res.data?.success) setProjects(res.data.data);
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
    </div>
  );
}
