import React, { useEffect, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import API from "../../api/api";
import { mapApiToRoute } from "../../utils/mapApiToRoute";
import CustomerCreateOverlay from './CustomerCreateOverlay';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showCreate, setShowCreate] = useState(false);
  
  const fetchCustomers = () => {
	  API.get("/api/customers")
		.then((response) => {
		  const data = response.data?.data; // <-- get the actual payload from API
		  if (Array.isArray(data)) {
			setCustomers(data);
		  } else if (data == null) {
			setCustomers([]);  // API returned null
		  } else {
			setCustomers([]);  // API returned something unexpected
			console.warn("Unexpected API response:", data);
		  }
		})
		.catch((err) => {
		  console.error(err);
		  setCustomers([]);
		});
	};

  useEffect(() => {
	fetchCustomers();
  }, []);

  // Filter customers based on search
  const filtered = customers.filter((c) =>
    c.customerName?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="container mt-3">
      <div><h1>Customer Portal</h1></div>
      {/* Top bar: search - title - create */}
      <div className="d-flex justify-content-between align-items-center mb-2 flex-nowrap">

        {/* Left: Search */}
        <div style={{ width: "250px" }}>
          <input
            type="text"
            className="form-control"	
            placeholder="Search customer..."
            value={searchText}
            onChange={(e) => {
              setPage(1);
              setSearchText(e.target.value);
            }}
          />
        </div>

        {/* Center title */}
        <div className="flex-grow-1 text-center">
		  <h3 className="m-0">Customer List</h3>
		</div>

        {/* Right: Create button */}
        <button className="btn btn-primary d-flex align-items-center" onClick={() => setShowCreate(true)}>
          <FaUserPlus className="me-2" /> Customer
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th style={{ width: "150px" }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length > 0 ? (
              paginated.map((c) => (
                <tr key={c.customerId}>
                  <td>{c.customerName}</td>
                  <td>{c.email}</td>
                  <td>{c.mobile}</td>
                  <td align="center">
                    <FaEdit className="me-2" />
                    <FaTrash className="me-2" />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div className="d-flex justify-content-between align-items-center mt-3">

        {/* Page size dropdown */}
        <div className="d-flex align-items-center">
          <span className="me-2">Rows per page:</span>
          <select
            className="form-select"
            style={{ width: "80px" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Page navigation buttons */}
        <div>
          <button
            className="btn btn-outline-primary me-2"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>

          <span className="mx-2">
            Page {page} of {totalPages || 1}
          </span>

          <button
            className="btn btn-outline-primary"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
	  
	  {/* Create Customer Overlay */}
		{showCreate && (
		  <CustomerCreateOverlay
			show={showCreate}
			onClose={() => setShowCreate(false)}
			onCreated={() => {
			  fetchCustomers();   // refresh list after create
			  setShowCreate(false);
			}}
		  />
		)}

    </div>
  );
}
