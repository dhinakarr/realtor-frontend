import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { FaPlus } from "react-icons/fa";
import "./CustomerComments.css"; // optional styling

export default function CustomerCommentsOverlay({ customerId, onClose, currentUser }) {
  const [comments, setComments] = useState([]);
  const [showTextarea, setShowTextarea] = useState(false);
  const [newComment, setNewComment] = useState("");

  const fetchComments = () => {
    API.get(`/api/customers/${customerId}/comments`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchComments();
  }, [customerId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    API.patch(`/api/customers/${customerId}/comments`, {
      text: newComment,
      addedBy: currentUser
    })
      .then(res => {
        setComments(res.data);
        setNewComment("");
        setShowTextarea(false);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="overlay">
      <div className="overlay-content">
        <div className="overlay-header">
          <h4>Comments</h4>
          <button onClick={() => setShowTextarea(true)} className="btn-add">
            <FaPlus /> Add
          </button>
          <button className="btn-close" onClick={onClose}>X</button>
        </div>

        <div className="comments-history">
          {comments.length === 0 ? (
            <p>No comments yet.</p>
          ) : (
            comments.map((c, idx) => (
              <div key={idx} className="comment-item">
                <div>{c.text}</div>
                <small>
                  {c.addedBy} | {new Date(c.addedAt).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>

        {showTextarea && (
          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your comment..."
            />
            <button onClick={handleAddComment} className="btn-submit">Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}
