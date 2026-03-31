import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import API from "../api/api";
import "./ReceivableDetailsModal.css";
import { FaTimes } from "react-icons/fa";
import { formatINRComma, formatINR, formatDate } from "../utils/numberFormatter";

function ReceivableDetailsModal({ open, onClose, from, to }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [plotFilter, setPlotFilter] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, from, to]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await API.get("/api/dashboard/sales/details", {
        params: { from, to },
      });

      setData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching receivable details", err);
    } finally {
      setLoading(false);
    }
  };
  
  const filteredData = data.filter(item => {
	  return (
		item.projectName?.toLowerCase().includes(projectFilter.toLowerCase()) &&
		item.plotNumber?.toLowerCase().includes(plotFilter.toLowerCase()) &&
		item.customerName?.toLowerCase().includes(customerFilter.toLowerCase())
	  );
	});

  if (!open) return null;
  
  const totalSales = filteredData.reduce((sum, item) => sum + (item.saleAmount || 0), 0);
  const totalReceived = filteredData.reduce((sum, item) => sum + (item.totalReceived || 0), 0);
  const totalOutstanding = filteredData.reduce((sum, item) => sum + (item.outstandingAmount || 0), 0);
  
  const projectOptions = [...new Set(data.map(d => d.projectName))];
  const plotOptions = [...new Set(data.map(d => d.plotNumber))];
  const customerOptions = [...new Set(data.map(d => d.customerName))];

  return (
    <div className="rd-modal-overlay">
      <div className="rd-modal">
        {/* Header */}
        <div className="rd-header">
          <h5>Receivable Details</h5>
          <FaTimes className="rd-close" onClick={onClose} />
        </div>

        {/* Body */}
        <div className="rd-body">
          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            <table responsive striped bordered hover className="rd-table">
              <thead className="rd-table-header">
                <tr>
                  <th>
				  <select onChange={(e) => setProjectFilter(e.target.value)}>
					  <option value="">All Projects</option>
					  {projectOptions.map((p, i) => (
						<option key={i} value={p}>{p}</option>
					  ))}
					</select>
				  </th>
                  <th>
				  <select onChange={(e) => setPlotFilter(e.target.value)}>
					  <option value="">All Plots</option>
					  {plotOptions.map((p, i) => (
						<option key={i} value={p}>{p}</option>
					  ))}
					</select>
				  </th>
                  <th>
				  <select onChange={(e) => setCustomerFilter(e.target.value)}>
					  <option value="">All Customers</option>
					  {customerOptions.map((p, i) => (
						<option key={i} value={p}>{p}</option>
					  ))}
					</select>
				  </th>
                  <th>Sales Value</th>
                  <th>Received</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
			  {filteredData.length === 0 ? (
				<tr>
				  <td colSpan="6" className="text-center">
					No data found
				  </td>
				</tr>
			  ) : (
				<>
				  {filteredData.map((item) => (
					<tr key={item.saleId}>
					  <td>{item.projectName}</td>
					  <td>{item.plotNumber}</td>
					  <td>{item.customerName}</td>
					  <td className="text-end">{formatINRComma(item.saleAmount)}</td>
					  <td className="text-end">{formatINRComma(item.totalReceived)}</td>
					  <td className="text-end" style={{ color: item.outstandingAmount > 0 ? "red" : "green" }}>{formatINRComma(item.outstandingAmount)}</td>
					</tr>
				  ))}

				  {/* ✅ TOTAL ROW */}
				  <tr className="rd-total-row">
					<td colSpan="3"><b>Total</b></td>
					<td className="text-end"><b>{formatINRComma(totalSales)}</b></td>
					<td className="text-end"><b>{formatINRComma(totalReceived)}</b></td>
					<td className="text-end"><b>{formatINRComma(totalOutstanding)}</b></td>
				  </tr>
				</>
			  )}
			</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReceivableDetailsModal;