import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import API from "../api/api";
import "./ReceivableDetailsModal.css";
import { FaTimes } from "react-icons/fa";
import { formatINRComma, formatINR, formatDate } from "../utils/numberFormatter";

function ReceivableDetailsModal({ open, onClose, from, to }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

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

  if (!open) return null;
  
  const totalSales = data.reduce((sum, item) => sum + (item.saleAmount || 0), 0);
  const totalReceived = data.reduce((sum, item) => sum + (item.totalReceived || 0), 0);
  const totalOutstanding = data.reduce((sum, item) => sum + (item.outstandingAmount || 0), 0);

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
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Plot</th>
                  <th>Customer</th>
                  <th>Sales Value</th>
                  <th>Received</th>
                  <th>Outstanding</th>
                </tr>
              </thead>
              <tbody>
			  {data.length === 0 ? (
				<tr>
				  <td colSpan="6" className="text-center">
					No data found
				  </td>
				</tr>
			  ) : (
				<>
				  {data.map((item) => (
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