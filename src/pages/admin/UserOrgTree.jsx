import React, { useEffect, useState, useRef } from "react";
import Tree from "react-d3-tree";
import { FaUser } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import API from "../../api/api";
import "./UserOrgTree.css";
import UserViewPage from "./UserViewPage";
import VerticalOrgTree from "./VerticalOrgTree";


const convertToD3Tree = (node) => {
  if (!node) return null;

  return {
    name: `${node.userName} (${node.employeeId})`,
    attributes: { userId: node.userId },
    children: node.children?.map(convertToD3Tree) || [],
  };
};

export default function UserOrgTree({ data }) {
  const featureUrl = "/api/users";
  const mapApiToRoute = (url) => url.replace("/api", "/admin");
  const module = useModule(featureUrl);

  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const treeContainer = useRef(null);

  const openUser = (userId) => {
    if (!userId) {
      console.error("openUser called with invalid userId", userId);
      return;
    }
    setSelectedUserId(userId);
    setShowDrawer(true);
  };

  const closeDrawer = () => {
    setShowDrawer(false);
    setSelectedUserId(null);
  };
  
  const normalizeTree = (node) => ({
	  userId: node.userId || node.user_id,
	  userName: node.userName || node.fullName || node.name,
	  employeeId: node.employeeId || node.employeeCode || node.emp_code,
	  children: (node.children || node.subordinates || []).map(normalizeTree),
	});


  useEffect(() => {
    API.get("/api/users/tree")
      .then((res) => {
        const raw = res.data?.data || [];
        const normalized = raw.map(normalizeTree);
        setTreeData(normalized);
      })
      .catch((err) => {
        console.error("Failed to load org tree", err);
        setTreeData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Center the tree in the container
  const containerStyles = {
    width: "100%",
    height: "80vh",
    overflowY: "auto",
    border: "1px solid #ddd",
    padding: "10px",
  };
  
  

  return (
    <div className="container-fluid">
      {module && <PageHeader module={module} mapApiToRoute={mapApiToRoute} />}

      {loading && <p className="text-center">Loading hierarchy...</p>}

      {!loading && !treeData && <p className="text-center">No hierarchy data available</p>}

	  {!loading && treeData && (
		  <VerticalOrgTree
			data={treeData}
			onUserClick={openUser}
		  />
		)}

	
      {/*!loading && treeData && (
        <div ref={treeContainer} style={containerStyles}>
          <Tree
            data={treeData}
            orientation="vertical"
            collapsible={true}
            zoomable={true}
            translate={{ x: 300, y: 50 }}
            nodeSize={{ x: 250, y: 100 }}
			separation={{ siblings: 1.2, nonSiblings: 1.5 }}
            
			renderCustomNodeElement={({ nodeDatum }) => (
			  <g>
				<foreignObject width={220} height={80} x={-110} y={-40}>
				  <div
					className="tree-node clickable"
					onClick={() => openUser(nodeDatum.attributes.userId)}
					style={{
					  border: "1px solid #ccc",
					  borderRadius: "6px",
					  background: "#fff",
					  padding: "6px 10px",
					  textAlign: "center",
					  cursor: "pointer",
					  fontSize: "13px",
					}}
				  >
					<div style={{ fontWeight: 600 }}>
					  <FaUser style={{ marginRight: 6 }} />
					  {nodeDatum.name}
					</div>
					<div style={{ fontSize: "12px", color: "#666" }}>
					  {nodeDatum.attributes.employeeId}
					</div>
				  </div>
				</foreignObject>
			  </g>
			)}

			
          />
        </div>
      )*/}

      {/* Right Slide Drawer */}
      <div className={`user-drawer ${showDrawer ? "open" : ""}`}>
        <div className="drawer-header">
          <span>User Details</span>
          <button className="btn btn-sm btn-light" onClick={closeDrawer}>
            ✕
          </button>
        </div>

        {selectedUserId && <UserViewPage id={selectedUserId} hideHeader />}
      </div>

      {showDrawer && <div className="drawer-backdrop" onClick={closeDrawer} />}
    </div>
  );
}
