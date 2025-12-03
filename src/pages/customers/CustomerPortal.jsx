import React, { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaStickyNote } from "react-icons/fa";
import API from "../../api/api";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const accessRights = JSON.parse(localStorage.getItem("accessRights") || "{}");
  const canCreate = accessRights?.customerCreate;

  useEffect(() => {
    loadData();
  }, [page, limit, search]);

  const loadData = async () => {
    const res = await API.get(`/api/customers?page=${page}&limit=${limit}&search=${search}`);
    if (res?.data?.success) {
      setCustomers(res.data.data.records || []);
      setTotal(res.data.data.total || 0);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 space-y-4">

      {/* Header Section */}
      <div className="grid grid-cols-12 items-center mb-4">
        {/* Search */}
        <div className="col-span-4 flex items-center gap-2">
          <FaSearch />
          <input
            type="text"
            placeholder="Search customers..."
            className="border p-2 rounded w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Title */}
        <div className="col-span-4 text-center">
          <h2 className="text-xl font-bold">Customer List</h2>
        </div>

        {/* Create Button */}
        <div className="col-span-4 text-right">
          {canCreate && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 ml-auto shadow hover:bg-blue-700">
              <FaPlus /> New
            </button>
          )}
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 bg-gray-100 p-3 rounded-xl font-semibold">
        <div className="col-span-3">Customer Name</div>
        <div className="col-span-3">Email</div>
        <div className="col-span-2">Mobile</div>
        <div className="col-span-4">Action</div>
      </div>

      {/* Table Rows */}
      {customers.map((c) => (
        <div key={c.customerId} className="grid grid-cols-12 p-3 border-b items-center">
          <div className="col-span-3">{c.customerName}</div>
          <div className="col-span-3">{c.email}</div>
          <div className="col-span-2">{c.mobile}</div>
          <div className="col-span-4 flex gap-4 text-lg">
            <FaEye className="cursor-pointer text-blue-600" />
            <FaEdit className="cursor-pointer text-green-600" />
            <FaTrash className="cursor-pointer text-red-600" />
            <FaStickyNote className="cursor-pointer text-yellow-600" />
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        {/* Page Size */}
        <div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border p-2 rounded"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        {/* Page Numbers */}
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-3 py-1">{page} / {totalPages || 1}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
