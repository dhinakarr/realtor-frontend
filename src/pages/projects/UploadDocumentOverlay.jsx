import React, { useEffect, useState  } from "react";
import API from "../../api/api";
import "./UploadDocumentOverlay.css";
import { useToast } from "../../components/common/ToastProvider";

export default function UploadDocumentOverlay({ show, projectId, onClose, onSuccess }) {
  const [documentType, setDocumentType] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const { showToast } = useToast();
  const BASE_URL = API.defaults.baseURL;
  
  const loadDocuments = async () => {
	  if (!projectId) return;

	  try {
		setLoadingDocs(true);
		const res = await API.get(`/api/projects/${projectId}/documents`);
		setDocuments(res.data?.data || []);
	  } catch (err) {
		showToast("Failed to load documents: "+err, "danger");
	  } finally {
		setLoadingDocs(false);
	  }
	};

	useEffect(() => {
	  if (show && projectId) {
		loadDocuments();
	  }
	}, [show, projectId]);


	useEffect(() => {
	  if (!show) {
		setDocuments([]);
	  }
	}, [show]);
	
	const getFileType = (filePath = "") => {
	  const ext = filePath.split(".").pop().toLowerCase();

	  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
	  if (ext === "pdf") return "pdf";
	  if (["doc", "docx"].includes(ext)) return "word";
	  if (["xls", "xlsx"].includes(ext)) return "excel";
	  if (["ppt", "pptx"].includes(ext)) return "ppt";
	  if (["zip", "rar", "7z"].includes(ext)) return "zip";

	  return "file";
	};

	
	
	const handleDelete = async (docId) => {
	  if (!window.confirm("Delete this document?")) return;

	  try {
		await API.delete(`/api/projects/documents/${docId}`);

		setDocuments(prev =>
		  prev.filter(d => d.documentId !== docId)
		);

		showToast("Document deleted successfully", "success");
	  } catch (err) {
		console.error(err);
		showToast("Failed to delete document", "danger");
	  }
	};



  const handleSubmit = async (e) => {
    e.preventDefault();

	const requiredFields = [
		{ value: documentType, message: "Please select document type" },
		{ value: documentNumber, message: "Please enter document number" },
		{ value: file, message: "Please select a file" },
	  ];

	  for (const field of requiredFields) {
		if (!field.value || field.value?.toString().trim() === "") {
		  return showToast(field.message, "warning");
		}
	  }

    const formData = new FormData();
    formData.append("documentType", documentType);
    formData.append("documentNumber", documentNumber);
    formData.append("files", file);

    try {
      setLoading(true);
      const res = await API.post(
        `/api/projects/${projectId}/documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
	  
	  // 🔥 reload documents to get filePath + documentId
		await loadDocuments();

		setDocumentType("");
		setDocumentNumber("");
		setFile(null);

		showToast("Document uploaded successfully", "success");
    } catch (err) {
      console.error(err);
      showToast("Upload failed", "danger");
    } finally {
      setLoading(false);
    }
  };
  
  if (!show) return null;

  return (
    <div className="upload-overlay">
      <div className="upload-header">
        <h6>Upload Document</h6>
        <button className="btn-close" onClick={onClose}></button>
      </div>

      <form onSubmit={handleSubmit} className="upload-body">
        <div className="row mb-3">
			<div className="col-6">
			  <label className="form-label">Document Type</label>
			  <select
				className="form-select"
				value={documentType}
				onChange={(e) => setDocumentType(e.target.value)}
				required
			  >
				<option value="">Select Document Type</option>
				<option value="IMAGE">Image</option>
				<option value="VIDEO">Video</option>
				<option value="PDF">PDF</option>
				<option value="DOC">Document</option>
			  </select>
			</div>


			<div className="col-6">
			  <label className="form-label">Document Name</label>
			  <input
				className="form-control"
				value={documentNumber}
				onChange={(e) => setDocumentNumber(e.target.value)}
				required
			  />
			</div>
		  </div>

		  <div className="mb-3">
			<label className="form-label">Upload File</label>
			<input
			  type="file"
			  className="form-control"
			  onChange={(e) => setFile(e.target.files[0])}
			  required
			/>
		  </div>

        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

		<div className="d-flex flex-wrap gap-1">
			<div  className="mb-2">
			<h6>Uploaded Documents</h6>

		  {documents.map((doc) => (
			<div key={doc.documentId} className="doc-icon-container">

			  <a
				href={`${BASE_URL}${doc.filePath}`}
				target="_blank"
				rel="noreferrer"
				className="doc-icon-wrapper"
				title={`${doc.documentType} - ${doc.documentNumber}`}
			  >
				{(() => {
				  const type = getFileType(doc.filePath);

				  switch (type) {
					case "image":
					  return (
						<img
						  src={`${BASE_URL}${doc.filePath}`}
						  alt={doc.documentType}
						  className="doc-thumb"
						/>
					  );

					case "pdf":
					  return <div className="doc-icon pdf">PDF</div>;

					case "word":
					  return <div className="doc-icon word">DOC</div>;

					case "excel":
					  return <div className="doc-icon excel">XLS</div>;

					case "ppt":
					  return <div className="doc-icon ppt">PPT</div>;

					case "zip":
					  return <div className="doc-icon zip">ZIP</div>;

					default:
					  return <div className="doc-icon file">FILE</div>;
				  }
				})()}

				
			  </a>

			  {/* DELETE ICON */}
			  <span
				className="doc-delete"
				onClick={() => handleDelete(doc.documentId)}
				title="Delete document"
			  >
				✕
			  </span>

			</div>
		  ))}
		  </div>
		</div>


	  
      </form>
    </div>
  );
}
