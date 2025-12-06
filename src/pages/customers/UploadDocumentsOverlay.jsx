import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { FaTimes, FaUpload, FaRegFileAlt, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFile } from "react-icons/fa";
import "./UploadDocumentsOverlay.css";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function UploadDocumentsOverlay({ show, customerId, onClose }) {
  const [existingDocs, setExistingDocs] = useState([]);
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  
  const BASE_URL = API.defaults.baseURL; 

  useEffect(() => {
    if (show && customerId) {
      loadExistingDocuments();
    }
  }, [show, customerId]);

  async function loadExistingDocuments() {
    try {
      const res = await API.get(`/api/customers/${customerId}/documents`);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setExistingDocs(list);
    } catch (err) {
      console.error("Document load error", err);
    }
  }

  function handleFileChange(e) {
    //setDocuments(Array.from(e.target.files));
	setUploadFiles(Array.from(e.target.files));
  }

  async function handleUpload() {
    //if (!documents.length) return;
	if (!uploadFiles.length) return;
    const formData = new FormData();
    //documents.forEach(file => formData.append("files", file));
	uploadFiles.forEach(file => formData.append("files", file));
    formData.append("documentType", documentType);
    formData.append("documentNumber", documentNumber);

    try {
      await API.post(`/api/customers/${customerId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      await loadExistingDocuments(); 
      //setDocuments([]);
	  setUploadFiles([]);
      alert("Documents uploaded successfully");
    } catch (err) {
      console.error("Upload error", err);
    }
  }
  
  function getFileIcon(path) {
	  if (!path) return <FaRegFileAlt size={22} />;

	  const ext = path.split(".").pop().toLowerCase();

	  switch (ext) {
		case "pdf":
		  return <FaFilePdf size={26} className="text-danger" />;

		case "jpg":
		case "jpeg":
		case "png":
		case "gif":
		case "webp":
		  return <FaFileImage size={26} className="text-info" />;

		case "doc":
		case "docx":
		  return <FaFileWord size={26} className="text-primary" />;

		case "xls":
		case "xlsx":
		  return <FaFileExcel size={26} className="text-success" />;

		case "txt":
		  return <FaFile size={26} className="text-secondary" />;

		default:
		  return <FaRegFileAlt size={26} className="text-dark" />;
	  }
	}
	
	const handleDelete = async (documentId) => {
	  confirmAlert({
		title: "Delete Document",
		message: "Are you sure you want to delete this document?",
		buttons: [
		  {
			label: "Yes",
			onClick: async () => {
			  try {
				await API.delete(`/api/customers/documents/${documentId}`);

				setExistingDocs((prev) =>
				  prev.filter((d) => String(d.documentId) !== String(documentId))
				);

				toast.success("Document deleted successfully");
			  } catch (err) {
				console.error(err);
				toast.error("Failed to delete document");
			  }
			},
		  },
		  {
			label: "No",
		  },
		],
	  });
	};


  return (
    <>
      {show && <div className="overlay-backdrop" onClick={onClose}></div>}

      <div className={`overlay-container ${show ? "show" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Upload Documents</h4>
          <FaTimes size={22} onClick={onClose} style={{ cursor: "pointer" }} />
        </div>

        {/* Upload Form */}
        <div>
          <div className="row">
            <div className="col-6">
              <label className="form-label">Document Type</label>
              <input
                type="text"
                className="form-control"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
              />
            </div>

            <div className="col-6">
              <label className="form-label">Document Number</label>
              <input
                type="text"
                className="form-control"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
              />
            </div>
          </div>
			<p />
          <input
            type="file"
            className="form-control mb-3"
            multiple
            onChange={handleFileChange}
          />

          <button className="btn btn-primary w-100" onClick={handleUpload}>
            <FaUpload /> Upload Documents
          </button>
        </div>

        <hr />
		
		<h5>Existing Documents</h5>
		{existingDocs.length === 0 && <p>No existingDocs found.</p>}

		<div className="doc-grid">
		  {existingDocs.map((doc) => (
			<div className="document-tile position-relative text-center p-2" key={doc.documentId}>
				<FaTimes
					className="delete-icon"
					onClick={() => handleDelete(doc.documentId)}
				  />
				<a
					href={BASE_URL+doc.filePath}
					target="_blank"
					rel="noopener noreferrer"
					className="text-decoration-none d-flex flex-column align-items-center"
				  >
				  {getFileIcon(doc.documentPath)}  {/* PURE ICON, NOT <img> */}
					<small className="mt-1">{doc.fileName}</small>
				 </a>

			</div>
		  ))}
		</div>
        
      </div>
    </>
  );
}
