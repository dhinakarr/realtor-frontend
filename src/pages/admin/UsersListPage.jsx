// /src/pages/admin/UsersListPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";
import UserCreateOverlay from "./UserCreateOverlay";
import UserEditOverlay from "./UserEditOverlay";
import UploadDocumentOverlay from "./UploadDocumentOverlay";
import { Link } from "react-router-dom";
import { FaUserPlus, FaPlus, FaEye, FaEdit, FaTrash, FaUpload } from "react-icons/fa";

export default function UsersListPage() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEditOverlay, setShowEditOverlay] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [managerFilter, setManagerFilter] = useState("");
  
  const featureUrl = "/api/users";
  const mapApiToRoute = (url) => url.replace("/api", "/admin");
  const module = useModule(featureUrl);
  //const moduleName = useModule(featureUrl).moduleName;
  
  const normalizeUrl = (url) => "/" + url.replace(/^\/+/, "").trim().toLowerCase();
  const feature = module?.features?.find(
			  f => normalizeUrl(f.url) === normalizeUrl(featureUrl)
			);
//console.log("UserListPage feature: "+JSON.stringify(feature));

  const loadData = useCallback(() => {
	  API.get(`/api/users/pages`, {
		  params: {
			page,
			size,
			search,
			role: roleFilter,
			manager: managerFilter
		  }
		})
		.then((res) => {
		  const result = res.data.data || {};
		  setList(result.data || []);
		  setTotalPages(result.totalPages || 1);
		})
		.catch((err) => {
		  console.error("Failed to load users page:", err);
		});
	}, [page, size, search, roleFilter, managerFilter]);

  
  useEffect(() => {
	loadData();
  }, [page, search, roleFilter, managerFilter]);
  
  const roleOptions = [...new Set(list.map(u => u.roleName).filter(Boolean))];
  const managerOptions = [...new Set(list.map(u => u.managerName).filter(Boolean))];
  
  const filteredList = list;
  
  const handleDeleteClick = (userId) => {
	  setSelectedUserId(userId);
	  setShowDeleteModal(true);
	};

	const handleConfirmDelete = () => {
	  API.delete(`/api/users/${selectedUserId}`)
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
	
	const handleSearchChange = (e) => {
	  const value = e.target.value;
	  setSearch(value);
	  setPage(1);

	  if (searchTimeout) {
		clearTimeout(searchTimeout);
	  }

	  const timeout = setTimeout(() => {
		// just trigger state change → useEffect will call loadData
	  }, 500);

	  setSearchTimeout(timeout);
	};
	
	const searchUsers = (query) => {
	  if (!query) {
		loadData(); // If search box empty, reload full list
		return;
	  }

	  API.get(`/api/users/search?searchText=${encodeURIComponent(query)}`)
		.then((res) => {
		  const result = res.data.data || {};
		  setList(result || []);
		  //setTotalPages(result.totalPages || 1);
		  //setPage(1); // reset to first page
		})
		.catch((err) => {
		  console.error("Search error:", err);
		  setList([]);
		});
	};
	
  return (
    <div>
		{module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}

      {/* Search Bar */}
      <div className="row mb-3 align-items-center">

		  {/* Search Box */}
		  <div className="col-md-4 col-sm-12">
			<input
			  type="text"
			  className="form-control"
			  placeholder="Search..."
			  value={search}
			  onChange={handleSearchChange}
			/>
		  </div>

		  {/* Page Title */}
		  <div className="col-md-4 col-sm-12 text-center">
			<h4 className="m-0">User List</h4>
		  </div>

		  {/* Create Button */}
		  <div className="col-md-4 col-sm-12 text-center">
			{feature?.canCreate && (

				<button
				  type="button"
				  onClick={() => setShowCreate(true)}
				  className="btn btn-primary"
				>
				  <FaUserPlus /> New
				</button>


			)}
		  </div>

		</div>

      {/* Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light text-center">
          <tr>
            <th>Name</th>
            <th>
				<select
				className="form-select form-select-sm"
				value={roleFilter}
				onChange={(e) => setRoleFilter(e.target.value)}
			  >
				<option value="">Role Name</option>
				{(roleOptions || []).map((role, i) => (
				  <option key={i} value={role}>{role}</option>
				))}
			  </select>
			</th>
            <th>Email</th>
            <th>
				<select
					className="form-select form-select-sm"
					value={managerFilter}
					onChange={(e) => setManagerFilter(e.target.value)}
				  >
					<option value="">Reporting Manager</option>
					{(managerOptions || []).map((m, i) => (
					  <option key={i} value={m}>{m}</option>
					))}
				  </select>
			</th>
			<th>Mobile</th>
            <th style={{ width: "100px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No users found
              </td>
            </tr>
          ) : (
            filteredList.map((u) => (
              <tr key={u.userId} title={`Employee ID: ${u.employeeId}`}>
                <td>{u.fullName } ({u.employeeId})</td>
                <td>{u.roleName}</td>
                <td>{u.email}</td>
		  <td>{u.managerName} ({u.managerEmpId}) </td>
				<td>{u.mobile}</td>
                <td>
				  <div className="d-flex align-items-center gap-1">
					{feature?.canRead && (
					  <Link
						to={`/admin/users/view/${u.userId}`}
						title="View User"
						className="btn btn-link p-0"
					  >
						<FaEye />
					  </Link>
					)}

					{feature?.canUpdate && (
					  <button
						type="button"
						className="btn btn-link p-0"
						title="Edit User"
						onClick={() => {
						  setSelectedUserId(u.userId);
						  setShowEditOverlay(true);
						}}
					  >
						<FaEdit />
					  </button>
					)}

					{feature?.canDelete && (
					  <span
						title="Delete User"
						onClick={() => handleDeleteClick(u.userId)}
						className="text-danger"
						style={{ cursor: "pointer" }}
					  >
						<FaTrash />
					  </span>
					)}
					
					<button
						type="button"
						className="btn btn-link p-0"
						title="Upload Document"
						onClick={() => {
						  setSelectedUserId(u.userId);
						  setShowUploadOverlay(true);
						}}
					  >
						<FaUpload className="text-primary" />
					  </button>
				  </div>
				</td>

              </tr>
            ))
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
				  <p>Are you sure you want to delete this user?</p>
				</div>
				<div className="modal-footer">
				  <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
				  <button className="btn btn-danger" onClick={handleConfirmDelete}>Delete</button>
				</div>
			  </div>
			</div>
		  </div>
		)}


      {/* Pagination */}
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
	  
	  
	  <UserCreateOverlay
		  show={showCreate}
		  onClose={() => setShowCreate(false)}
		  onSuccess={loadData}
		/>
		
	  <UserEditOverlay
		  show={showEditOverlay}
		  userId={selectedUserId}
		  onClose={() => setShowEditOverlay(false)}
		  onSuccess={loadData}
		/>

		<UploadDocumentOverlay
		  show={showUploadOverlay}
		  userId={selectedUserId}
		  onClose={() => setShowUploadOverlay(false)}
		  onSuccess={() => {
			setShowUploadOverlay(false);
			// optional: reload user list or show toast
		  }}
		/>

	  
    </div>
  );
}