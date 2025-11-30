// /src/pages/admin/PermissionListPage.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";

import { Link } from "react-router-dom";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function PermissionListPage() {
	//console.log("=== PermissionListPage MOUNTED ===");
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPermissionId, setSelectedPermissionId] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  
  // these 2 lines help us to load and select the modules from dropdown
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  
  const featureUrl = "/api/permissions";
  //const mapApiToRoute = (url) => url.replace("/api", "/admin");
  const module = useModule(featureUrl);
  //const moduleName = module.moduleName;
  //console.log("PermissionListPage permission: "+JSON.stringify(module));
  const normalizeUrl = (url) => "/" + url.replace(/^\/+/, "").trim().toLowerCase();
  const feature = module.features.find(
			  f => normalizeUrl(f.url) === normalizeUrl(featureUrl)
			);
//console.log("PermissionListPage permission: "+JSON.stringify(feature));

  const startEdit = (perm) => {
	  setEditingId(perm.permissionId);
	  setEditValues({
		roleId: perm.roleId,
		canCreate: perm.canCreate,
		canRead: perm.canRead,
		canUpdate: perm.canUpdate,
		canDelete: perm.canDelete
	  });
	};

	const saveRow = (permissionId) => {
		//console.log("Saving:", { permissionId, ...editValues});
	  API.patch(`/api/permissions/${permissionId}`, {permissionId, ...editValues})
		.then(() => {
		  loadData();
		  setEditingId(null);
		})
		.catch((err) => console.error("Update error:", err));
	};
	
	const cancelEdit = () => {
	  setEditingId(null);
	  setEditValues({});
	};

  const loadData = () => {
	  API.get(`/api/permissions`)   // your endpoint
		.then((res) => {
		  const modules = res.data.data || [];
		  
		  setModules(modules);
		  if (modules.length > 0 && !selectedModuleId) {
			setSelectedModuleId(modules[0].moduleId);  // default selection
			setList(modules[0].features || []);        // load first module features
		  }
		  
		  //const flatPermissions = modules.flatMap(m => m.features || []);
		  //setList(flatPermissions); // store the module list directly
		  //setTotalPages(1); // no pagination
		  //console.log("PermissionListPage permission: "+JSON.stringify(list));
		})
		.catch(() => {});
	};

  useEffect(() => {
    loadData();
  }, [page]);

  const handleDeleteClick = (permissionId) => {
	  setSelectedPermissionId(permissionId);
	  setShowDeleteModal(true);
	};

  const handleModuleChange = (e) => {
	  const moduleId = e.target.value;
	  setSelectedModuleId(moduleId);

	  const module = modules.find(m => m.moduleId === moduleId);
	  setList(module?.features || []);
	};

	const handleConfirmDelete = () => {
	  API.delete(`/api/permissions/${selectedPermissionId}`)
		.then(() => {
		  // refresh list after deletion
		  loadData();
		  setShowDeleteModal(false);
		})
		.catch(() => {
		  // handle error
		  setShowDeleteModal(false);
		});
	};
	
  return (
    <div className="container-fluid">
		{module && ( <PageHeader module={module} />   )}
      <p></p>
      {/* Search Bar */}
      <div className="row mb-3 align-items-center">

		  {/* Search Box */}
		  <select
			  className="col-md-4 col-sm-12"
			  value={selectedModuleId}
			  onChange={handleModuleChange}
			>
			  {modules.map(m => (
				<option key={m.moduleId} value={m.moduleId}>
				  {m.moduleName}
				</option>
			  ))}
			</select>

		  {/* Page Title */}
		  <div className="col-md-4 col-sm-12 text-center">
			<h4 className="m-0">Permissions List</h4>
		  </div>

		  {/* Create Button */}
		  <div className="col-md-4 col-sm-12 text-center">
			{feature?.canCreate && (
			  <Link to="/admin/permissions/create" className="btn btn-primary">
				  <FaPlus /> New
				</Link>
			)}
		  </div>

		</div>

      {/* Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Feature Name</th>
			<th>Role Name</th>
            <th>canCreate</th>
			<th>canRead</th>
			<th>canUpdate</th>
			<th>canDelete</th>
            <th style={{ width: "140px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
		  {list.length === 0 ? (
			<tr>
			  <td colSpan="7" className="text-center">No Permissions found</td>
			</tr>
		  ) : (
			list.map((u) => {
			  const isEditing = editingId === u.permissionId;

			  return (
				<tr key={u.permissionId} className={isEditing ? "table-warning" : ""}>
				  <td>{u.featureName}</td>
				  <td>{u.roleName}</td>

				  {/* canCreate */}
				  <td>
					{isEditing ? (
					  <input
						type="checkbox"
						checked={editValues.canCreate}
						onChange={(e) =>
						  setEditValues({ ...editValues, canCreate: e.target.checked })
						}
					  />
					) : u.canCreate ? "Yes" : "No"}
				  </td>

				  {/* canRead */}
				  <td>
					{isEditing ? (
					  <input
						type="checkbox"
						checked={editValues.canRead}
						onChange={(e) =>
						  setEditValues({ ...editValues, canRead: e.target.checked })
						}
					  />
					) : u.canRead ? "Yes" : "No"}
				  </td>

				  {/* canUpdate */}
				  <td>
					{isEditing ? (
					  <input
						type="checkbox"
						checked={editValues.canUpdate}
						onChange={(e) =>
						  setEditValues({ ...editValues, canUpdate: e.target.checked })
						}
					  />
					) : u.canUpdate ? "Yes" : "No"}
				  </td>

				  {/* canDelete */}
				  <td>
					{isEditing ? (
					  <input
						type="checkbox"
						checked={editValues.canDelete}
						onChange={(e) =>
						  setEditValues({ ...editValues, canDelete: e.target.checked })
						}
					  />
					) : u.canDelete ? "Yes" : "No"}
				  </td>

				  {/* ACTIONS */}
				  <td className="text-center">

					{isEditing ? (
					  <>
						<button
						  className="btn btn-success btn-sm me-2"
						  onClick={() => saveRow(u.permissionId)}
						>
						  Save
						</button>

						<button
						  className="btn btn-secondary btn-sm"
						  onClick={cancelEdit}
						>
						  Cancel
						</button>
					  </>
					) : (
					  <>
						{feature?.canUpdate && (
						  <button
							className="btn btn-link p-0 me-2"
							title="Edit"
							onClick={() => startEdit(u)}
						  >
							<FaEdit />
						  </button>
						)}

						{feature?.canDelete && (
						  <span
							onClick={() => handleDeleteClick(u.permissionId)}
							className="text-danger"
							style={{ cursor: "pointer" }}
							title="Delete"
						  >
							<FaTrash />
						  </span>
						)}
					  </>
					)}

				  </td>
				</tr>
			  );
			})
		  )}
		</tbody>

      </table>
	  
	  {showDeleteModal && (
		  <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
			<div className="modal-dialog modal-dialog-centered">
			  <div className="modal-content">
				<div className="modal-header">
				  <h5 className="modal-title">Confirm Delete</h5>
				  <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
				</div>
				<div className="modal-body">
				  <p>Are you sure you want to delete this Permission Data?</p>
				</div>
				<div className="modal-footer">
				  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
				  <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
				</div>
			  </div>
			</div>
		  </div>
		)}


      {/* Pagination 
      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${page === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setPage(page + 1)}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
*/}
    </div>
  );
}
