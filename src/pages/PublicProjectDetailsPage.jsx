import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import "./PublicProjectDetailsPage.css";

export default function PublicProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const BASE_URL = API.defaults.baseURL;

  useEffect(() => {
    API.get(`/public/projects/details/${id}`)
      .then((res) => {
        if (res.data.success) setProjectData(res.data.data);
      })
      .catch(console.error);
  }, [id]);

  const openPlotOverlay = (plotId) => {
    API.get(`/public/plots/${plotId}`)
      .then((res) => {
        if (res.data.success) setSelectedPlot(res.data.data);
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

      {/* Project Card */}
      <div className="card p-3 mb-3">
        {project.files?.length > 0 && (
          <img
            src={`${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`}
            alt={project.projectName}
            style={{ width: "100%", borderRadius: "6px", height: "350px", objectFit: "cover" }}
          />
        )}

        <p><strong>Location:</strong> {project.locationDetails}</p>
        <p><strong>Survey Number:</strong> {project.surveyNumber}</p>
        <p><strong>Start Date:</strong> {project.startDate}</p>
        <p><strong>Price/Sqft:</strong> {project.pricePerSqft}</p>
      </div>

      {/* Plots */}
      <div className="project-grid">
        {plots.map((plot) => (
          <div
            key={plot.plotId}
            className="plot-square"
            style={{ backgroundColor: getPlotColor(plot.status), cursor: "pointer" }}
            onClick={() => openPlotOverlay(plot.plotId)}
          >
            <div className="plot-number">{plot.plotNumber}</div>
            <div className="plot-data">
              <div>Area: {plot.width || "-"} × {plot.breath || "-"}</div>
              <div>Facing: {plot.facing || "-"}</div>
              <div>Road: {plot.roadWidth || "-"}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sliding Overlay */}
      {selectedPlot && (
        <>
          {/* Dark semi-transparent background */}
          <div className="overlay-backdrop" onClick={closeOverlay}></div>

          <div className="plot-overlay slide-in">
            <div className="plot-overlay-content">
              <button className="close-overlay btn btn-secondary" onClick={closeOverlay}>X Close</button>
              <h5>Plot {selectedPlot.plotNumber} Details</h5>
              <p><strong>Status:</strong> {selectedPlot.status}</p>
              <p><strong>Area:</strong> {selectedPlot.width && selectedPlot.breath ? `${selectedPlot.width}×${selectedPlot.breath}` : "-"}</p>
              <p><strong>Facing:</strong> {selectedPlot.facing || "-"}</p>
              <p><strong>Road Width:</strong> {selectedPlot.roadWidth || "-"}</p>
              <p><strong>Base Price:</strong> {selectedPlot.basePrice || "-"}</p>
              <p><strong>Total Price:</strong> {selectedPlot.totalPrice || "-"}</p>
              <p><strong>Prime Plot:</strong> {selectedPlot.isPrime ? "Yes" : "No"}</p>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
