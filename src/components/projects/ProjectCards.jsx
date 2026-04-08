import React from "react";
import { FaEdit, FaTrash, FaUpload, FaTags } from "react-icons/fa";
import UploadDocumentOverlay from "../../pages/projects/UploadDocumentOverlay";


export default function ProjectCards({
  projects,
  BASE_URL,
  canEdit = false,
  canDelete = false,
  onView,
  onEdit,
  onDelete,
  onUpload,
  setActiveVideo,
  setShowVideoModal,
  onPricing,
}) {

  return (
    <div className="row">
      {projects.map((project) => {
        const img =
          project.files && project.files.length > 0
            ? `${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`
            : null;

        const videoDoc = project.documents?.find(
          (d) => d.documentType === "VIDEO"
        );

        return (
          <div
            key={project.projectId}
            className={`col-md-4 mb-4 project-card-wrapper ${
              project._fade ? "fade-out" : ""
            }`}
          >
            <div
              className="card shadow-sm h-100 position-relative cursor-pointer hover:shadow-lg"
              onClick={() => onView?.(project.projectId)}
            >
              {/* ACTION ICONS */}
			  
              {(canEdit || canDelete) && (
				<div className="project-icon-overlay">
				  {canEdit && (
					  <FaTags
						title="Update Pricing"
						className="project-icon"
						onClick={(e) => {
						  e.stopPropagation();
						  onPricing(project);
						}}
					  />
					)}
                  {canEdit && (
                    <FaEdit
                      className="project-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(project.projectId);
                      }}
                    />
                  )}
                  {canEdit && (
                    <FaUpload
                      className="project-icon"
                      onClick={(e) => {
						e.stopPropagation();   // ✅ MUST
						e.preventDefault();    // ✅ ADD THIS
						onUpload?.(project.projectId);
					  }}
                    />
                  )}
                </div>
              )}

              {/* IMAGE */}
              {img && (
                <img
                  src={img}
                  alt={project.projectName}
                  className="card-img-top"
                  style={{
                    height: "180px",
                    objectFit: "cover",
                  }}
                />
              )}

              {/* BODY */}
              <div className="card-body d-flex align-items-center gap-3">
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-1">{project.projectName}</h5>

                  <small className="text-muted">
                    {project.locationDetails}
                  </small>

                  <p className="mb-1" />

                  <small className="text-muted">
                    Plots: {project.noOfPlots} (Start: {project.plotStartNumber})
                  </small>

                  <div className="mt-2 text-secondary">
                    Survey Number: <small>{project.surveyNumber}</small>
                  </div>

                  <div className="mt-2 text-secondary">
                    Guideline Value: <small>{project.guidanceValue}</small>
                  </div>
                </div>

                {/* VIDEO */}
                {videoDoc && (
                  <div className="video-thumb-container">
                    <div
                      className="video-thumb-wrapper"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveVideo(videoDoc);
                        setShowVideoModal(true);
                      }}
                    >
                      <span className="video-thumb-icon">▶</span>
                    </div>
                  </div>
                )}
              </div>

              {/* DELETE */}
              {canDelete && (
                <div className="card-footer bg-white position-relative">
                  <FaTrash
                    className="text-danger position-absolute"
                    style={{ right: "10px", bottom: "8px", cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(project.projectId, e);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}