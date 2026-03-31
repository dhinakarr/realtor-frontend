import React, { useState } from "react";
import { formatINRComma, formatINR } from "../../utils/numberFormatter";
import ChartMount from "../../components/ChartMount";
import PlotStatusDonut from "../../pages/projects/PlotStatusDonut";
import { FaPlus, FaEdit, FaTrash, FaMoneyBill } from "react-icons/fa";

export default function ProjectDetailsContent({
  projectData,
  plots,
  BASE_URL,
  onPlotClick,
  pCreate,
  canEdit,
  canDelete,
  renderPlotActions, // 🔥 important
  onMediaClick,
}) {
  if (!projectData) return null;
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [facingFilter, setFacingFilter] = useState("ALL");

  const { project } = projectData;

  const getPlotColor = (status) => {
    switch (status) {
      case "AVAILABLE": return "lightblue";
      case "BOOKED": return "yellow";
      case "SOLD": return "green";
      case "CANCELLED": return "grey";
      default: return "#ffffff";
    }
  };
  
  const filteredPlots = (plots || []).filter(plot => {
	  const statusMatch =
		statusFilter === "ALL" || plot.status === statusFilter;

	  const facingMatch =
		facingFilter === "ALL" || plot.facing === facingFilter;

	  return statusMatch && facingMatch;
	});
  
  const galleryImages =
    project.documents?.filter(d => d.documentType === "IMAGE") || [];

  const galleryVideos =
    project.documents?.filter(d => d.documentType === "VIDEO") || [];

  return (
    <>
      {/* ================= PROJECT INFO ================= */}
      <div className="project-card p-3 mb-3">

        {project.files?.length > 0 && (
			<div className="row mb-3">
			  <div className="col-12">
				<img
				  src={`${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`}
				  alt={project.projectName}
				  className="img-fluid rounded"
				  style={{
					width: "100%",
					height: "300px",
					objectFit: "cover"
				  }}
				/>
			  </div>
			</div>
		  )}

		  
		  <div className="row g-3 align-items-stretch">
			<div className="col-md-4">
			  <h4 className="mb-3">{project.projectName}</h4>
			  <p><small>Location:</small> {project.locationDetails}</p>
			  <p><small>Survey Number:</small> {project.surveyNumber}</p>
			  <p><small>Price / Sqft:</small> ₹{formatINRComma(project.pricePerSqft)}</p>
			</div>
			<div className="col-md-4">
			  <p><small>Stamp Duty:</small> {formatINRComma(project.regCharges)}%</p>
			  <p><small>Documentation Charges:</small> ₹{formatINRComma(project.docCharges)}</p>
			  <p><small>Other Charges:</small> ₹{formatINRComma(project.otherCharges)}</p>
			  <p><small>Guideline Value:</small> ₹{formatINRComma(project.guidanceValue)}</p>
			</div>
			<div className="col-md-4 d-flex flex-column align-items-center"
			 style={{ minWidth: 0 }}
			>
			  <h6 className="mb-2">Inventory Status</h6>

			  <div
				style={{
				  width: "100%",
				  maxWidth: 260,
				  height: 180
				}}
			  >
				<ChartMount>
				  <PlotStatusDonut stat={projectData.stat} />
				</ChartMount>
			  </div>
			</div>

		  </div>
      </div>

      {/* ================= PLOT GRID ================= */}
		<div className="d-flex gap-3 mb-3 align-items-center">
  
		  {/* Status Filter */}
		  <select style={{ width: "clamp(140px, 15vw, 200px)" }}
			className="form-select"
			value={statusFilter}
			onChange={(e) => setStatusFilter(e.target.value)}
		  >
			<option value="ALL">All Status</option>
			<option value="AVAILABLE">Available</option>
			<option value="BOOKED">Booked</option>
			<option value="SOLD">Sold</option>
			<option value="CANCELLED">Cancelled</option>
		  </select>

		  {/* Facing Filter */}
		  <select style={{ width: "clamp(140px, 15vw, 200px)" }}
			className="form-select"
			value={facingFilter}
			onChange={(e) => setFacingFilter(e.target.value)}
		  >
			<option value="ALL">All Facing</option>
			<option value="North">North</option>
			<option value="South">South</option>
			<option value="East">East</option>
			<option value="West">West</option>
		  </select>
		
			<button
			  className="btn btn-secondary"
			  onClick={() => {
				setStatusFilter("ALL");
				setFacingFilter("ALL");
			  }}
			>
			  Clear Filters
			</button>
		</div>
	  
	  
	     <div className="project-grid">
			  {filteredPlots
				  .filter((plot) => {
					// Management users see everything
					if (pCreate) return true;

					// Other users should NOT see cancelled plots
					return plot.status !== "CANCELLED";
				  })
				  .map((plot) => (
				<div
				  key={plot.plotId}
				  className={`plot-square ${plot._animate ? "fade-anim" : ""}`}
				  style={{ backgroundColor: getPlotColor(plot.status) }}
				  onClick={() => onPlotClick?.(plot.plotId)}
				>
				  <div className="plot-content-wrapper">
					<div className="plot-number">Plot {plot.plotNumber}</div>

					<div className="plot-data">
					  <div>Area: {plot.area} sft</div>
					  <div>Facing: {plot.facing || ""}</div>
					  <div>Survey: {plot.surveyNum}</div>
					  {plot.status === "AVAILABLE" && (
						  <div>Total: {formatINRComma(plot.totalPrice)}</div>
						)}

					</div>
					
					{/* 🔥 Inject actions from parent */}
					{renderPlotActions && (
						<div className="top-icons">
						  {renderPlotActions(plot)?.edit}
						</div>
					  )}

					  {/* 🔥 BOTTOM RIGHT (Delete etc.) */}
					  {renderPlotActions && (
						<div className="bottom-icons">
						  {renderPlotActions(plot)?.bottom}
						</div>
					  )}
				  </div>
				</div>
			  ))}
			</div>
	  
      {/* ================= GALLERY ================= */}
      {(galleryImages.length > 0 || galleryVideos.length > 0) && (
        <section className="project-media-section">
          <h5>Project Media</h5>

          <div className="project-gallery">

			  {/* ✅ IMAGES */}
			  {galleryImages.map(doc => (
				<div
				  key={doc.documentId}
				  className="gallery-item"
				  onClick={() => onMediaClick?.(doc, "IMAGE")}
				>
				  <img
					src={`${BASE_URL}${doc.filePath}`}
					alt=""
				  />
				</div>
			  ))}

			  {/* ✅ VIDEOS */}
			  {galleryVideos.map(doc => (
				<div
				  key={doc.documentId}
				  className="video-thumb-wrapper"
				  onClick={() => onMediaClick?.(doc, "VIDEO")}
				>
				  <video
					src={`${BASE_URL}${doc.filePath}`}
					muted
					preload="metadata"
				  />
				  <span className="play-icon">▶</span>
				</div>
			  ))}

			</div>
        </section>
      )}
    </>
  );
}