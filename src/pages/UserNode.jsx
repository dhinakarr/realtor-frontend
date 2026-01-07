import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

export default function UserNode({ user, level }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = user.children?.length > 0;

  return (
    <div style={{ marginLeft: level * 20 }}>
      <div
        className="flex items-center gap-2 cursor-pointer py-1 hover:bg-gray-100 rounded"
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
        ) : (
          <span style={{ width: 16 }} />
        )}

        <span className="font-medium">{user.userName}</span>

        {/* Optional action */}
        <button
          className="ml-auto text-sm text-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Open user detail:", user.userId);
          }}
        >
          View
        </button>
      </div>

      {expanded &&
        user.children.map(child => (
          <UserNode
            key={child.userId}
            user={child}
            level={level + 1}
          />
        ))}
    </div>
  );
}
