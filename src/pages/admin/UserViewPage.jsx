import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { mapApiToRoute } from "../../utils/mapApiToRoute";

export default function UserViewPage({ id: propId, hideHeader = false }) {
  const { id: paramId } = useParams();
  const id = propId || paramId;
  const navigate = useNavigate();

  // Load module + features (sidebar & breadcrumb header)
  const module = useModule("/api/users");
//console.log("UserViewPage module: " +JSON.stringify(module));
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
	  if (!id) {
		console.log("UserViewPage id: "+id);
		return;
	  }
    API.get(`/api/users/${id}`)
      .then((res) => {
        setRecord(res.data.data || {});
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!record) return <div>No data found</div>;

  const meta = record.meta || {};

  return (
    <div className="container mt-4">

      {/* === PAGE HEADER (Navigation, Breadcrumb, Feature Links) === */}
      {!hideHeader && module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}

      {/* === MAIN CARD WRAPPER === */}
      <div
        className="card shadow-sm p-4 mt-3"
        style={{ maxWidth: "50%", minWidth: "350px" }}
      >
        <h5 className="fw-bold mb-4">User Details</h5>

        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Full Name</th>
              <td>{record.fullName}</td>
            </tr>

            <tr>
              <th>Email</th>
              <td>{record.email}</td>
            </tr>

            <tr>
              <th>Mobile</th>
              <td>{record.mobile}</td>
            </tr>

            <tr>
              <th>Role</th>
              <td>{record.roleName}</td>
            </tr>

            <tr>
              <th>Manager Name</th>
              <td>{record.managerName}</td>
            </tr>
			<tr>
              <th>Address</th>
              <td>{record.address}</td>
            </tr>

            <tr>
              <th>Profile Image</th>
              <td>
                {record.profileImage ? (
				  <img
					src={`data:image/jpeg;base64,${record.profileImage}`}
					className="img-thumbnail"
					style={{
					  width: "80px",
					  height: "80px",
					  objectFit: "cover",
					  borderRadius: "6px"
					}}
				  />
				) : (
				  <span>No image</span>
				)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* === META DATA === */}
        
            <h5>Additional Details</h5>
{Object.keys(meta).length > 0 && (
          <>
            <table className="table table-striped table-bordered">
              <tbody>
                {Object.entries(meta).map(([key, value]) => (
                  <tr key={key}>
                    <th style={{ width: "40%" }}>{key}</th>
                    <td>{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
		{!hideHeader && (
				  <div className="d-flex justify-content-start mt-4">
			
			  <button className="btn btn-outline-primary" onClick={() => navigate("/admin/users")}>
				<i className="fa fa-arrow-left me-1"></i> Back
			  </button>
			</div>
		)}
      </div>
    </div>
  );
}
