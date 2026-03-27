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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  
  const [filters, setFilters] = useState({
					  userName: "",
					  projectName: ""
					});
  
  const featureUrl = "/api/site-visits";
  const module = useModule(featureUrl);
  const feature = module.features.find(f => f.url);
  const isFinance = (feature.financeRole == "FINANCE") ? true : false;

  useEffect(() => {
    fetchVisits();
  }, []);	

  const handleFilterChange = (e) => {
	  setFilters(prev => ({
		...prev,
		[e.target.name]: e.target.value
	  }));
	};
	
  const filteredData = data.filter(row => {
	  const userMatch =
		!filters.userName || row.userName === filters.userName;

	  const projectMatch =
		!filters.projectName || row.projectName === filters.projectName;

	  return userMatch && projectMatch;
	});

  const fetchVisits = async (from, to) => {
	  setLoading(true);
	  try {
		const res = await API.get("/api/site-visits", {
		  params: {
			...(from && { fromDate: from }),
			...(to && { toDate: to }),
		  },
		});

		const list =
		  Array.isArray(res.data)
			? res.data
			: res.data.data || res.data.content || [];

		setData(list);
	  } finally {
		setLoading(false);
	  }
	};
	
	const handleApplyFilter = () => {
	  if (fromDate && toDate && fromDate > toDate) {
		alert("Invalid date range");
		return;
	  }

	  fetchVisits(fromDate, toDate);
	};

  const truncate = (text, max = 20) =>
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
      <div className="row align-items-center mb-3">

		  {/* LEFT */}
		  <div className="col-3">
			<h4 className="mb-0">Site Visits</h4>
		  </div>

		  {/* CENTER (more space) */}
		  <div className="col-6 d-flex justify-content-center">
			<div className="d-flex gap-2 align-items-center flex-nowrap">

			  <div className="d-flex align-items-center gap-1">
				<label className="mb-0">From</label>
				<input
				  type="date"
				  className="form-control form-control-sm"
				  value={fromDate}
				  onChange={(e) => setFromDate(e.target.value)}
				  style={{ width: "130px" }}
				/>
			  </div>

			  <div className="d-flex align-items-center gap-1">
				<label className="mb-0">To</label>
				<input
				  type="date"
				  className="form-control form-control-sm"
				  value={toDate}
				  onChange={(e) => setToDate(e.target.value)}
				  style={{ width: "130px" }}
				/>
			  </div>

			  <Button size="sm" onClick={handleApplyFilter}>
				Apply
			  </Button>

			  <Button
				size="sm"
				variant="secondary"
				onClick={() => {
				  setFromDate("");
				  setToDate("");
				  fetchVisits();
				}}
			  >
				Reset
			  </Button>

			</div>
		  </div>

		  {/* RIGHT */}
		  <div className="col-3 text-end">
			{feature?.canCreate && (
			  <Button
				variant="primary"
				size="sm"
				className="px-3"
				onClick={() => setShowForm(true)}
			  >
				<FaPlus className="me-1" /> New
			  </Button>
			)}
		  </div>

		</div>

      {/* Table */}
      <Table bordered hover responsive size="sm">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>
				<select
					name="userName"
					className="form-select form-select-sm"
					value={filters.userName}
					onChange={handleFilterChange}
				  >
					<option value="">User Name</option>
					{[...new Set(data.map(d => d.userName))].map(u => (
					  <option key={u} value={u}>{u}</option>
					))}
				  </select>
			</th>
            <th>
				<select
				  name="projectName"
				  className="form-select form-select-sm"
				  value={filters.projectName}
				  onChange={handleFilterChange}
				>
				  <option value="">Project Name</option>
				  {[...new Set(data.map(d => d.projectName))].map(p => (
					<option key={p} value={p}>{p}</option>
				  ))}
				</select>
			</th>
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

          {filteredData.map((row) => (
            <tr key={row.siteVisitId}  className="align-middle">
              <td>{row.visitDate}</td>
              <td>{row.userName}</td>
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
			{feature?.canUpdate && (	
                <FaEdit
                  className="me-2 text-success cursor-pointer"
				  style={{ cursor: 'pointer' }}
                  title="Edit"
				  onClick={() => {
					setEditVisitId(row.siteVisitId);
					setShowEditDrawer(true);
				  }}
                />
			)}	
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
