import React, { useEffect, useState } from "react";
import "./CustomerOverlay.css";
import API from "../../api/api";
import { FaTimes, FaFilePdf, FaFileWord, FaFileImage, FaFileAlt } from "react-icons/fa";

const CustomerViewOverlay = ({ customerId, onClose }) => {
  const [customer, setCustomer] = useState(null);
  const BASE_URL = API.defaults.baseURL; 

  useEffect(() => {
    if (customerId) {
      API.get(`/api/customers/${customerId}`)
        .then((res) => setCustomer(res.data.data))
        .catch((err) => console.error(err));
    }
  }, [customerId]);
  
  function getIconForFile(filename) {
    const ext = filename.split('.').pop().toLowerCase();

    switch (ext) {
        case "pdf": return "📄";
        case "doc":
        case "docx": return "📝";
        case "xls":
        case "xlsx": return "📊";
        case "png":
        case "jpg":
        case "jpeg": return "🖼️";
        default: return "📁";
    }
  }
  
  function DocumentItem({ doc }) {
    const fileUrl = `${BASE_URL}${doc.publicUrl}`;  // <-- Correct URL

    return (
        <a 
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="document-item"
        >
            <span className="doc-icon">{getIconForFile(doc.fileName)}</span>
            <span className="doc-name">{doc.fileName}</span>
        </a>
    );
  }

  // ⛔ PREVENT CRASHES – do NOT render until data is loaded
  if (!customerId || customer === null) return null;

  return (
    <div className="overlay">
      <div className="overlay-panel slide-in">

        <div className="overlay-header">
          <h3>Customer Details</h3>
          <FaTimes className="close-btn" onClick={onClose} />
        </div>

        {/* Profile Image */}
        <div className="profile-section">
          <img
            src={`${BASE_URL}${customer.profileImagePath}`}
            alt="Profile"
            className="profile-image"
          />
          <div className="customer-name">{customer.customerName}</div>
        </div>

        {/* Information Grid */}
        <div className="info-grid">
          <div className="info-item">
            <label>Name</label>
            <span>{customer.customerName}</span>
          </div>

          <div className="info-item">
            <label>Email</label>
            <span>{customer.email}</span>
          </div>

          <div className="info-item">
            <label>Mobile</label>
            <span>{customer.mobile}</span>
          </div>

          <div className="info-item">
            <label>Alt Mobile</label>
            <span>{customer.altMobile}</span>
          </div>

          <div className="info-item">
            <label>City</label>
            <span>{customer.city}</span>
          </div>

          <div className="info-item">
            <label>State</label>
            <span>{customer.state}</span>
          </div>

          <div className="info-item full">
            <label>Address</label>
            <span className="multiline">{customer.address}</span>
          </div>

          <div className="info-item full">
            <label>Notes</label>
            <span className="multiline">{customer.notes}</span>
          </div>
        </div>
		
		{/* Documents Section */}
		{/* Documents Section */}
		<div className="documents-section">
		  <h4 className="section-title">Documents</h4>

		  {(!customer.documents || customer.documents.length === 0) && (
			<div className="no-docs">No documents available</div>
		  )}

		  {customer.documents?.length > 0 && (
			<ul className="document-list">
			  {customer.documents.map((doc) => {
				const fileUrl = `${BASE_URL}${doc.filePath}`;
				const ext = doc.filePath.split(".").pop().toLowerCase();
				const isImage = ["jpg", "jpeg", "png", "gif"].includes(ext);

				return (
				  <li key={doc.documentId} className="document-item">

					{/* Thumbnail OR Icon */}
					{isImage ? (
					  <img src={fileUrl} alt="document" className="doc-thumb" />
					) : (
					  <span className="doc-icon-wrapper">{getIconForFile(doc.filePath)}</span>
					)}

					<span className="doc-label">
					  {doc.documentType} – {doc.documentNumber}
					</span>

					<a
					  className="doc-download"
					  href={fileUrl}
					  target="_blank"
					  rel="noreferrer"
					>
					  Download
					</a>
				  </li>
				);
			  })}
			</ul>
		  )}
		</div>




      </div>
    </div>
  );
};

export default CustomerViewOverlay;
