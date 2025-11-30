import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import { mapApiToRoute } from "../../utils/mapApiToRoute";

export default function FeatureViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Load module + features (sidebar & breadcrumb header)
  const module = useModule("/api/features");
//console.log("UserViewPage module: " +JSON.stringify(module));
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/api/features/${id}`)
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
        <h5 className="fw-bold mb-4">Feature Details</h5>

        <table className="table table-bordered">
          <tbody>
		    <tr>
              <th>Feature Name</th>
              <td>{record.featureName}</td>
            </tr>
            <tr>
              <th>Module Name</th>
              <td>{record.moduleName}</td>
            </tr>

            <tr>
              <th>Description</th>
              <td>{record.description}</td>
            </tr>
          </tbody>
        </table>
	
		<div className="d-flex justify-content-start mt-4">
			<button className="btn btn-outline-primary" onClick={() => navigate("/admin/features")}>
				<i className="fa fa-arrow-left me-1"></i> Back
			</button>
		</div>
      </div>
    </div>
  );
}
