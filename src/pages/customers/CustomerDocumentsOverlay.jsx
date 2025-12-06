import React, { useEffect, useState } from "react";
import { FaTimes, FaUpload } from "react-icons/fa";
import API from "../../api/api";
import "./CustomerDocumentsOverlay.css";


export default function CustomerDocumentsOverlay({ customerId, onClose }) {
  const [existingDocs, setExistingDocs] = useState([]);
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [files, setFiles] = useState([]);

  const fetchDocuments = () => {
    API.get(`/api/customers/${customerId}/documents`)
      .then((res) => setExistingDocs(res.data || []))
      .catch(() => setExistingDocs([]));
  };

  useEffect(() => {
    fetchDocuments();
  }, [customerId]);

  const handleUpload = () => {
    if (!documentType || !documentNumber || files.length === 0) {
      alert("Please enter document details and choose files.");
      return;
    }

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("documentNumber", documentNumber);

    for (let f of files) {
      formData.append("files", f);
    }

    API.post(`/api/customers/${customerId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
      .then(() => {
        fetchDocuments();
        setDocumentType("");
        setDocumentNumber("");
        setFiles([]);
        alert("Documents uploaded successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Upload failed");
      });
  };

  return (
    <div className="documents-overlay">
      <div className="documents-content">
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Customer Documents</h3>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>

        {/* FORM */}
        <div className="mb-3">
          <label className="form-label">Document Type</label>
          <input
            className="form-control"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Document Number</label>
          <input
            className="form-control"
            value={documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Upload Files</label>
          <input
            type="file"
            multiple
            className="form-control"
            onChange={(e) => setFiles(e.target.files)}
          />
        </div>

        <button className="btn btn-success mb-4" onClick={handleUpload}>
          <FaUpload className="me-2" />
          Upload Documents
        </button>

        {/* DOCUMENT LIST */}
        <h5>Existing Documents</h5>
        {existingDocs.length === 0 && (
          <p>No documents uploaded yet.</p>
        )}

        {existingDocs.length > 0 && (
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Document Number</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {existingDocs.map((doc) => (
                <tr key={doc.documentId}>
                  <td>{doc.documentType}</td>
                  <td>{doc.documentNumber}</td>
                  <td>
                    <a href={doc.documentPath} target="_blank">
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}
