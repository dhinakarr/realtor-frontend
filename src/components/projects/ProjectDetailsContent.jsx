export default function ProjectDetailsContent({
  projectData,
  plots,
  onPlotClick,
  onEdit,
  onDelete,
  onSale,
  isReadOnly,
  BASE_URL
}) {
  if (!projectData) return <div>Loading...</div>;

  const { project } = projectData;

  return (
    <div className="project-details-container">

      {/* PROJECT INFO */}
      <div className="project-card p-3 mb-3">

        {project.files?.length > 0 && (
          <img
            src={`${BASE_URL}/api/projects/file/${project.files[0].projectFileId}`}
            alt={project.projectName}
            style={{ width: "100%", height: 300, objectFit: "cover" }}
          />
        )}

        <h4>{project.projectName}</h4>
        <p>{project.locationDetails}</p>
      </div>

      {/* PLOTS */}
      <div className="project-grid">
        {plots.map(plot => (
          <div
            key={plot.plotId}
            className="plot-square"
            onClick={() => onPlotClick?.(plot.plotId)}
          >
            <div>Plot {plot.plotNumber}</div>

            {!isReadOnly && (
              <button onClick={(e) => {
                e.stopPropagation();
                onEdit?.(plot.plotId);
              }}>
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}