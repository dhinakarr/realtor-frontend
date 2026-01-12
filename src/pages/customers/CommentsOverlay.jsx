import React, { useEffect, useState } from "react";
import { FaTimes, FaTrash, FaPlus } from "react-icons/fa";
import API from "../../api/api"; // your axios wrapper
import "./CommentsOverlay.css";

export default function CommentsOverlay({ show, customerId, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddBox, setShowAddBox] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");

  // Load comments when overlay opens
  useEffect(() => {
    if (!show || !customerId) return;
    loadComments();
  }, [show, customerId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/customers/${customerId}/comments`);
      setComments(res.data.data || []);
    } catch (err) {
      console.error("Error fetching comments", err);
    }
    setLoading(false);
  };

  const addComment = async () => {
    if (!newCommentText.trim()) return;
    try {
      const payload = {
        comment: newCommentText.trim()
      };

      const res = await API.post(
        `/api/customers/${customerId}/comments`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      setComments(res.data.data || []);
      setNewCommentText("");
      setShowAddBox(false);
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const deleteComment = async (index) => {
    try {
      const res = await API.delete(
        `/api/customers/${customerId}/comments`,
        { params: { index } }
      );
      setComments(res.data.data || []);
    } catch (err) {
      console.error("Error deleting comment", err);
    }
  };

  return (
    <div className={`comments-overlay ${show ? "open" : ""}`}>
      <div className="comments-header">
        <h5>Comments</h5>
        <FaTimes className="close-icon" onClick={onClose} />
      </div>

      {/* Add new comment button */}
      <div className="add-comment-bar">
	  
		
        <button className="add-btn" onClick={() => setShowAddBox(!showAddBox)}>
          <FaPlus size={15} style={{ cursor: "pointer" }} /> Add
        </button>
      </div>

      {/* Add comment box */}
      {showAddBox && (
        <div className="add-comment-box">
          <textarea
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder="Write your comment…"
          />
          <button className="save-btn" onClick={addComment}>
            Save
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-body">
        {loading ? (
          <p>Loading...</p>
        ) : comments.length === 0 ? (
          <p>No comments found.</p>
        ) : (
          comments.map((c, index) => (
            <div key={index} className="comment-card">
              <div className="comment-meta">
                <small>{c.userName || "Unknown User"} &nbsp;</small>
                <small> {c.addedAt?.substring(0, 19).replace("T", " ")}</small>
              </div>
			  <div className="comment-text">{c.comment}</div>
				  {/*
              <FaTrash
                className="delete-icon"
                onClick={() => deleteComment(index)}
              />
				  */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
