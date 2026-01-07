import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaEye, FaEdit, FaMoneyBillWave, FaPlus } from "react-icons/fa";
import API from "../../api/API";
import SiteVisitFormDrawer from "./SiteVisitFormDrawer";
import SiteVisitViewDrawer from "./SiteVisitViewDrawer";
import SiteVisitEditDrawer from "./SiteVisitEditDrawer";
import SitePaymentDrawer from "./SitePaymentDrawer";
import useModule from "../../hooks/useModule";

export default function SiteVisitList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [viewVisitId, setViewVisitId] = useState(null);
  const [editVisitId, setEditVisitId] = useState(null);
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [showViewDrawer, setShowViewDrawer] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false);
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  
  const featureUrl = "/api/site-visits";
  const module = useModule(featureUrl);
  const feature = module.features.find(f => f.url);
  const isFinance = (feature.financeRole == "FINANCE") ? true : false;

  useEffect(() => {
    fetchVisits();
  }, []);	

  const fetchVisits = async () => {
	  setLoading(true);
	  try {
		const res = await API.get("/api/site-visits");

		// 🔑 Normalize response
		const list =
		  Array.isArray(res.data)
			? res.data
			: res.data.data || res.data.content || [];

		setData(list);
	  } finally {
		setLoading(false);
	  }
	};

  const truncate = (text, max = 15) =>
    text.length > max ? text.substring(0, max) + ".." : text;

  const renderWithTooltip = (text) => (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip>{text}</Tooltip>}
    >
      <span className="text-truncate" style={{ cursor: "pointer" }}>
        {truncate(text)}
      </span>
    </OverlayTrigger>
  );

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
		  <h4 className="mb-0">Site Visits</h4>

		  <div className="flex-shrink-0">
			<Button variant="primary" size="sm" className="px-3" 
			onClick={() => setShowForm(true)}>
			  <FaPlus className="me-1" /> New
			</Button>
		  </div>
		</div>

      {/* Table */}
      <Table bordered hover responsive size="sm">
        <thead className="table-light">
          <tr>
            <th>Visit Date</th>
            <th>User</th>
            <th>Project</th>
            <th>Customers</th>
            <th>Expense</th>
            <th>Balance</th>
            <th style={{ width: "120px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center">
                No site visits found
              </td>
            </tr>
          )}

          {data.map((row) => (
            <tr key={row.siteVisitId}  className="align-middle">
              <td>{row.visitDate}</td>

              <td>{renderWithTooltip(row.userName)}</td>

              <td>{renderWithTooltip(row.projectName)}</td>

              <td>
                {row.customers?.map((c, idx) => (
                  <div key={idx}>
                    {renderWithTooltip(c.customerName)}
                  </div>
                ))}
              </td>

              <td className="text-end"> {row.expenseAmount}</td>

              <td className="text-end"> {row.balance}</td>

              <td className="text-center">
                <FaEye
				  className="me-2 text-success cursor-pointer"
				  title="View"
				  style={{ cursor: 'pointer' }}
				  onClick={() => {
					setViewVisitId(row.siteVisitId);
					setShowViewDrawer(true);
				  }}
				/>
                <FaEdit
                  className="me-2 text-success cursor-pointer"
				  style={{ cursor: 'pointer' }}
                  title="Edit"
				  onClick={() => {
					setEditVisitId(row.siteVisitId);
					setShowEditDrawer(true);
				  }}
                />
				{isFinance && (
                <FaMoneyBillWave
                  className="text-success cursor-pointer"
				  style={{ cursor: 'pointer' }}
                  title="Payment"
				  onClick={() => {
					setSelectedVisit({
					  siteVisitId: row.siteVisitId,
					  userId: row.userId,
					  balance:row.balance
					});
					setPaymentDrawerOpen(true);
				  }}
                />
				)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
	  
	  <SiteVisitFormDrawer
		  show={showForm}
		  onClose={() => setShowForm(false)}
		  onSaved={fetchVisits}
		/>
	  <SiteVisitViewDrawer
	  show={showViewDrawer}
	  siteVisitId={viewVisitId}
	  onClose={() => setShowViewDrawer(false)}
	/>
		<SiteVisitEditDrawer
		  show={showEditDrawer}
		  siteVisitId={editVisitId}
		  onClose={() => setShowEditDrawer(false)}
		  onSaved={fetchVisits}
		/>
	
	
		{selectedVisit && (
		  <SitePaymentDrawer
			show={paymentDrawerOpen}
			siteVisitId={selectedVisit.siteVisitId}
			userId={selectedVisit.userId}
			balance={selectedVisit.balance}
			onClose={() => {
			  setPaymentDrawerOpen(false);
			  setSelectedVisit(null);
			}}
			onSaved={fetchVisits}
		  />
		)}
	  
    </div>
  );
}
