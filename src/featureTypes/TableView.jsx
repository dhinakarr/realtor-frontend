export default function TableView({ data, onEdit, onDelete }) {
  return (
    <table className="table table-striped">
      <thead>
        <tr>
          {Object.keys(data[0] || {}).map((key) => (
            <th key={key}>{key}</th>
          ))}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            {Object.keys(item).map((key) => (
              <td key={key}>{item[key]}</td>
            ))}
            <td>
              <button className="btn btn-sm btn-warning" onClick={() => onEdit(item)}>Edit</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
