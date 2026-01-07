import React, { useEffect, useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { FaUser } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import API from "../../api/api";
import "./UserOrgTree.css";
import UserViewPage from "./UserViewPage";

/**
 * Recursive renderer for org chart
 */
const RenderTree = ({ node, onUserClick }) => {
  if (!node) return null;
    
  return (
    <TreeNode
      key={node.userId}
      label={
        <div className="tree-node clickable" onClick={() => onUserClick(node.userId)}>
          <FaUser className="me-2" />
          {node.userName}
        </div>
      }
    >
      {node.children &&
        node.children.map((child) => (
          <RenderTree key={child.userId} node={child} 
		  onUserClick={onUserClick} 
		/>
        ))}
    </TreeNode>
  );
};

export default function UserOrgTree({ data }) {
  const featureUrl = "/api/users";
  const mapApiToRoute = (url) => url.replace("/api", "/admin");
  const module = useModule(featureUrl);
  
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  
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
  
  useEffect(() => {
    API.get("/api/users/tree")
      .then((res) => {
        setTreeData(res.data?.data || null);
      })
      .catch((err) => {
        console.error("Failed to load org tree", err);
        setTreeData(null);
      })
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="container-fluid">
      {module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}
	  
	  {loading && (
        <p className="text-center">Loading hierarchy...</p>
      )}

      {!loading && !treeData && (
        <p className="text-center">No hierarchy data available</p>
      )}

      {!loading && treeData && (
        <Tree
          lineWidth="2px"
          lineColor="#ccc"
          lineBorderRadius="10px"
        >
          {treeData.map((root) => (
				<RenderTree key={root.userId} node={root} onUserClick={openUser} />
			  ))}
        </Tree>
      )}
	  
	  {/* Right Slide Drawer */}
		<div className={`user-drawer ${showDrawer ? "open" : ""}`}>
		  <div className="drawer-header">
			<span>User Details</span>
			<button className="btn btn-sm btn-light" onClick={closeDrawer}>
			  ✕
			</button>
		  </div>

		  {selectedUserId && (
			<UserViewPage id={selectedUserId} hideHeader />
		  )}
		</div>

		{showDrawer && (
		  <div className="drawer-backdrop" onClick={closeDrawer} />
		)}

    </div>
  );
}
