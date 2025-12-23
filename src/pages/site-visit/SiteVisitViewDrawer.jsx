import React, { useEffect, useState } from "react";
import { Offcanvas, Spinner, Table } from "react-bootstrap";
import API from "../../api/API";

export default function SiteVisitViewDrawer({ show, siteVisitId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [visit, setVisit] = useState(null);

  useEffect(() => {
    if (show && siteVisitId) {
      fetchVisit();
    }
  }, [show, siteVisitId]);

  const fetchVisit = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/site-visits/${siteVisitId}`);
      setVisit(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="end"
      backdrop
      style={{ width: "500px" }}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Site Visit Details</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        {loading && <Spinner animation="border" />}
        {!loading && visit && (
          <>
            <Table bordered size="sm">
              <tbody>
                <tr>
                  <th>Date of Visit</th>
                  <td>{visit.visitDate}</td>
                </tr>
                <tr>
                  <th>PA/PM</th>
                  <td>{visit.userName}</td>
                </tr>
                <tr>
                  <th>Project</th>
                  <td>{visit.projectName}</td>
                </tr>
                <tr>
                  <th>Vehicle Type</th>
                  <td>{visit.vehicleType}</td>
                </tr>
                <tr>
                  <th>Expense Amount</th>
                  <td className="text-end">₹ {visit.expenseAmount}</td>
                </tr>
                <tr>
                  <th>Total Paid</th>
                  <td className="text-end">₹ {visit.totalPaid}</td>
                </tr>
                <tr>
                  <th>Balance</th>
                  <td className="text-end">₹ {visit.balance}</td>
                </tr>
                <tr>
                  <th>Status</th>
                  <td>{visit.status}</td>
                </tr>
                <tr>
                  <th>Remarks</th>
                  <td>{visit.remarks}</td>
                </tr>
                <tr>
                  <th>Customers</th>
                  <td>
                    {visit.customers?.map((c, idx) => (
                      <div key={idx} className="mb-2">
                        <strong>{c.customerName}</strong> <br />
                        Mobile: {c.mobile} <br />
                        Sold By: {c.soldBy || "-"}
                      </div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
