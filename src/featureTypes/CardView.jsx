export default function CardView({ data, onEdit, onDelete }) {
  return (
    <div className="d-flex flex-wrap gap-3">
      {data.map((item) => (
        <div key={item.id} className="card p-3" style={{ width: "200px" }}>
          {Object.entries(item).map(([key, value]) => (
            <p key={key}><strong>{key}:</strong> {value}</p>
          ))}
          <div className="d-flex justify-content-between">
            <button className="btn btn-sm btn-warning" onClick={() => onEdit(item)}>Edit</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
