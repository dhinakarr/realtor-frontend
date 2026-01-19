import React, { useState } from "react";
import { FaUser } from "react-icons/fa";
import "./UserOrgTree.css";

const VerticalNode = ({ node, level = 0, onUserClick }) => {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginLeft: level * 28 }}>
      <div
        className="tree-row"
        onClick={() => onUserClick(node.userId)}
      >
        {node.children?.length > 0 && (
          <span
            className="toggle"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? "▼" : "▶"}
          </span>
        )}

        <FaUser className="me-2" />
        <strong>{node.userName}</strong>
        <span className="ms-2 text-muted">
          ({node.employeeId})
        </span>
      </div>

      {open && (
		  <div className="tree-node-children">
			{node.children?.map((child) => (
			  <VerticalNode
				key={child.userId}
				node={child}
				level={level + 1}
				onUserClick={onUserClick}
			  />
			))}
		  </div>
		)}

    </div>
  );
};

export default function VerticalOrgTree({ data, onUserClick }) {
  if (!data?.length) return null;

  return (
    <div
      className="vertical-org-tree"
      style={{
        height: "80vh",
        overflowY: "auto",
        padding: "10px",
      }}
    >
      {data.map((root) => (
        <VerticalNode
          key={root.userId}
          node={root}
          onUserClick={onUserClick}
        />
      ))}
    </div>
  );
}
