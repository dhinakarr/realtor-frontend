import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { mapApiToRoute } from "../../utils/mapApiToRoute";

export default function RoleViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load module + features (sidebar & breadcrumb header)
  const module = useModule("/api/roles");
//console.log("UserViewPage module: " +JSON.stringify(module));
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/api/roles/${id}`)
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
      {module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}

      {/* === MAIN CARD WRAPPER === */}
      <div
        className="card shadow-sm p-4 mt-3"
        style={{ maxWidth: "50%", minWidth: "350px" }}
      >
        <h5 className="fw-bold mb-4">Role Details</h5>

        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Role Name</th>
              <td>{record.roleName}</td>
            </tr>

            <tr>
              <th>Description</th>
              <td>{record.description}</td>
            </tr>
            <tr>
              <th>Superior Role</th>
              <td>{record.managerRole}</td>
            </tr>       
			<tr>
              <th>Role Type</th>
              <td>{record.financeRole}</td>
            </tr>			
          </tbody>
        </table>
	
		<div className="d-flex justify-content-start mt-4">
			<button className="btn btn-outline-primary" onClick={() => navigate("/admin/roles")}>
				<i className="fa fa-arrow-left me-1"></i> Back
			</button>
		</div>
      </div>
    </div>
  );
}
