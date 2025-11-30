// /src/pages/admin/RolesListPage.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/api";
import PageHeader from "../../components/PageHeader";
import useModule from "../../hooks/useModule";

import { Link } from "react-router-dom";
import { FaPlus, FaEye, FaEdit, FaTrash } from "react-icons/fa";

export default function RolesListPage() {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  
  const featureUrl = "/api/roles";
  const mapApiToRoute = (url) => url.replace("/api", "/admin");
  const module = useModule(featureUrl);
  const moduleName = useModule(featureUrl).moduleName;
  
  const normalizeUrl = (url) => "/" + url.replace(/^\/+/, "").trim().toLowerCase();
  const feature = module.features.find(
			  f => normalizeUrl(f.url) === normalizeUrl(featureUrl)
			);
//console.log("RolesListPage feature: "+JSON.stringify(feature));

  const loadData = () => {
    API.get(`/api/roles/pages?page=${page}&size=${size}`)
      .then((res) => {
        const result = res.data.data || {};
        setList(result.data || []);
        setTotalPages(result.totalPages || 1);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, [page]);
/*
  const filtered = list.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase())
  );
*/
  const handleDeleteClick = (roleId) => {
	  setSelectedRoleId(roleId);
	  setShowDeleteModal(true);
	};

	const handleConfirmDelete = () => {
	  API.delete(`/api/roles/${selectedRoleId}`)
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

	  if (searchTimeout) {
		clearTimeout(searchTimeout);
	  }

	  // Wait 500ms after role stops typing
	  const timeout = setTimeout(() => {
		searchRoles(value);
	  }, 500);

	  setSearchTimeout(timeout);
	};
	
	const searchRoles = (query) => {
	  if (!query) {
		loadData(); // If search box empty, reload full list
		return;
	  }

	  API.get(`/api/roles/search?searchText=${encodeURIComponent(query)}`)
		.then((res) => {
		  const result = res.data.data || {};
		  setList(result || []);
		  setTotalPages(result.totalPages || 1);
		  setPage(1); // reset to first page
		  //console.log("RoleListPage search list: "+list[0].roleName);
		})
		.catch((err) => {
		  console.error("Search error:", err);
		  setList([]);
		});
	};
	
  return (
    <div className="container-fluid">
		{module && (
        <PageHeader module={module} mapApiToRoute={mapApiToRoute} />
      )}
      <p></p>
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
			<h4 className="m-0">Roles List</h4>
		  </div>

		  {/* Create Button */}
		  <div className="col-md-4 col-sm-12 text-center">
			{feature?.canCreate && (

			<Link to="/admin/roles/create" className="btn btn-primary">
			  <FaPlus /> New
			</Link>

					)}
				  </div>

		  </div>

      {/* Table */}
      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Role Name</th>
            <th>Descripion</th>
            <th>Status</th>
            <th style={{ width: "140px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No roles found
              </td>
            </tr>
          ) : (
            list.map((u) => (
              <tr key={u.roleId}>
                <td>{u.roleName}</td>
                <td>{u.description}</td>
                <td>
                  <span className={`badge ${u.status === "ACTIVE" ? "bg-success" : "bg-secondary"}`}>
                    {u.status}
                  </span>
                </td>
                <td>
				{feature?.canRead && (
                  <Link to={`/admin/roles/view/${u.roleId}`} title="View Role" className="btn btn-link p-0 me-2">
                    <FaEye />
                  </Link>
				)}
				{feature?.canUpdate && (
                  <Link to={`/admin/roles/edit/${u.roleId}`} title="Edit Role" className="btn btn-link p-0 me-2">
                    <FaEdit />
                  </Link>
				)}
				{feature?.canDelete && (
				  <span
					onClick={() => handleDeleteClick(u.roleId)}
					className="text-danger"
					style={{ cursor: "pointer" }}
					title="Delete Role"
				  >
					<FaTrash />
				  </span>
				)}
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
				  <p>Are you sure you want to delete this Role?</p>
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
    </div>
  );
}
