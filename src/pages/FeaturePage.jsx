import React, { useEffect, useState } from "react";
import API from "../api/api"; // Axios instance
import { useParams } from "react-router-dom";
import TableView from "./featureTypes/TableView";
import CardView from "./featureTypes/CardView";
import FeatureForm from "./featureTypes/FeatureForm";

export default function FeaturePage({ user }) {
  const { featureUrl, featureName } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayType, setDisplayType] = useState("table"); // default
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get(featureUrl);
        setData(res.data);
        // Optionally, detect display type dynamically
        if (featureName.toLowerCase().includes("card")) setDisplayType("card");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [featureUrl]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="feature-page p-3">
      <h3>{featureName}</h3>
      {user?.permissions && user.permissions.canCreate && (
        <button
          className="btn btn-primary mb-3"
          onClick={() => setEditingItem({})} // open empty form
        >
          Create New
        </button>
      )}
      {editingItem && (
        <FeatureForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(updated) => {
            // update local state
            if (editingItem.id) {
              setData((prev) =>
                prev.map((d) => (d.id === updated.id ? updated : d))
              );
            } else {
              setData((prev) => [updated, ...prev]);
            }
            setEditingItem(null);
          }}
        />
      )}
      {displayType === "table" ? (
        <TableView
          data={data}
          onEdit={setEditingItem}
          onDelete={(id) => setData(data.filter((d) => d.id !== id))}
        />
      ) : (
        <CardView
          data={data}
          onEdit={setEditingItem}
          onDelete={(id) => setData(data.filter((d) => d.id !== id))}
        />
      )}
    </div>
  );
}
