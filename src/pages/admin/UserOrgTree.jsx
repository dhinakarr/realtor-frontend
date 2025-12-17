import React, { useEffect, useState } from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { FaUser } from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import API from "../../api/api";
import "./UserOrgTree.css";

/**
 * Recursive renderer for org chart
 */
const RenderTree = ({ node }) => {
  if (!node) return null;

  return (
    <TreeNode
      key={node.userId}
      label={
        <div className="tree-node">
          <FaUser className="me-2" />
          {node.userName}
        </div>
      }
    >
      {node.children &&
        node.children.map((child) => (
          <RenderTree key={child.userId} node={child} />
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
				<RenderTree key={root.userId} node={root} />
			  ))}
        </Tree>
      )}
    </div>
  );
}
