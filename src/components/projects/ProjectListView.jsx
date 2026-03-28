import React from "react";
import { FaEdit, FaTrash, FaUpload } from "react-icons/fa";

export default function ProjectListView({
  projects = [],
  loading,
  BASE_URL,
  onView,
  onEdit,
  onDelete,
  onUpload,
  showActions = false // 🔥 control actions visibility
}) {

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

  if (loading) return <p>Loading...</p>;
  if (!projects.length) return <p className="text-muted">No Data to display</p>;

  return (
    <>
      {/* Cards */}
      <div className="row">
        {projects.map((project) => {
          const img =
            project.files?.length > 0
              ? `${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`
              : null;

          return (
            <div key={project.projectId} className="col-md-4 mb-4">
              <div
                className="card h-100 cursor-pointer"
                onClick={() => onView?.(project.projectId)}
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
                  <h5>{project.projectName}</h5>
                  <small>{project.locationDetails}</small>
                </div>

                {/* 🔥 Actions (only when allowed) */}
                {showActions && (
                  <div className="card-footer d-flex gap-2">
                    <FaEdit onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(project.projectId);
                    }} />
                    <FaUpload onClick={(e) => {
                      e.stopPropagation();
                      onUpload?.(project.projectId);
                    }} />
                    <FaTrash onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(project.projectId);
                    }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}