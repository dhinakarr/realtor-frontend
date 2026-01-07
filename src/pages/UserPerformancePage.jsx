import React, { useEffect, useState, memo } from "react";
import API from "../api/api";

/* =========================
   API FUNCTIONS
========================= */

async function fetchUserHierarchy() {
  const res = await API.get("/api/users/tree");

  const raw = res.data.data;

  const normalize = node => ({
    userId: node.userId ?? node.id,
    userName: node.userName ?? node.name,
    children: (node.children ?? node.subordinates ?? []).map(normalize)
  });

  return raw.map(normalize);
}

const fetchUserPerformance = async (userId, filters) => {
	
  const res = await API.get(`/api/performance/${userId}`, {
    params: {
      fromDate: filters.fromDate || null,
      toDate: filters.toDate || null
    }
  });

  return res.data;
};

function SiteVisitsTable({ visits }) {
  if (!visits?.length) return null;

  return (
    <>
      <h6 className="mt-4">Site Visits</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Date</th>
            <th>Project</th>
            <th>Customer</th>
            <th>Expense</th>
          </tr>
        </thead>
        <tbody>
          {visits.map(v => (
            <tr key={v.siteVisitId}>
              <td>{v.visitDate}</td>
              <td>{v.projectName}</td>
              <td>{v.customerName}</td>
              <td>₹{v.expenseAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function SalesTable({ sales }) {
  if (!sales?.length) return null;

  return (
    <>
      <h6 className="mt-4">Sales</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Plot</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Confirmed</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.saleId}>
              <td>{s.plotNumber}</td>
              <td>{s.customerName}</td>
              <td>₹{s.saleAmount}</td>
              <td>{s.confirmedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function ReceivableTable({ receivable }) {
  if (!receivable?.length) return null;

  const grouped = Object.values(
    receivable.reduce((acc, r) => {
      const key = r.plotNumber;
      acc[key] = acc[key] || {
        plotNumber: r.plotNumber,
        customerName: r.customerName,
        saleAmount: r.saleAmount,
        received: 0
      };
      acc[key].received += r.totalReceived;
      return acc;
    }, {})
  );

  return (
    <>
      <h6 className="mt-4">Receivables</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Plot</th>
            <th>Customer</th>
            <th>Sale</th>
            <th>Received</th>
            <th>Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(r => (
            <tr key={r.plotNumber}>
              <td>{r.plotNumber}</td>
              <td>{r.customerName}</td>
              <td>₹{r.saleAmount}</td>
              <td>₹{r.received}</td>
              <td>₹{r.saleAmount - r.received}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function CommissionTable({ commission }) {
  if (!commission?.length) return null;

  return (
    <>
      <h6 className="mt-4">Commission</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Project</th>
            <th>Sale Amount</th>
            <th>Total</th>
            <th>Paid</th>
          </tr>
        </thead>
        <tbody>
          {commission.map(c => (
            <tr key={c.commissionId}>
              <td>{c.projectName}</td>
              <td>₹{c.saleAmount}</td>
              <td>₹{c.totalCommission}</td>
              <td className="text-success">₹{c.commissionPaid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}


/* =========================
   MAIN PAGE
========================= */

export default function UserPerformancePage() {
  const [hierarchy, setHierarchy] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: "",
	toDate: ""
  });

  useEffect(() => {
    fetchUserHierarchy().then(data => {
      setHierarchy(data);
      if (data.length > 0) {
        setSelectedUser(data[0]); // auto-select root user
      }
    });
  }, []);

  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">

        {/* LEFT: USER HIERARCHY */}
        <div className="col-3 border-end overflow-auto">
          <h6 className="mt-2 mb-3">Hierarchy</h6>

          {hierarchy.map(root => (
            <TreeNode
              key={root.userId}
              node={root}
              level={0}
              selectedUserId={selectedUser?.userId}
              onUserSelect={setSelectedUser}
            />
          ))}
        </div>

        {/* RIGHT: PERFORMANCE VIEW */}
        <div className="col-9 overflow-auto p-3">
          {!selectedUser ? (
            <div className="text-muted">
              Select a user from the hierarchy to view performance
            </div>
          ) : (
            <UserPerformancePanel
              user={selectedUser}
              filters={filters}
              onFilterChange={setFilters}
            />
          )}
        </div>

      </div>
    </div>
  );
}

/* =========================
   TREE NODE
========================= */

const TreeNode = memo(function TreeNode({
  node,
  level,
  selectedUserId,
  onUserSelect
}) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children?.length > 0;

  return (
    <div>
      <div
        className={`d-flex align-items-center py-1 px-2 rounded ${
          selectedUserId === node.userId ? "bg-primary text-white" : "hover-bg"
        }`}
        style={{ paddingLeft: level * 20, cursor: "pointer" }}
      >
        {hasChildren ? (
          <span
            className="me-2 fw-bold"
            onClick={e => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{ width: 16 }}
          >
            {expanded ? "−" : "+"}
          </span>
        ) : (
          <span style={{ width: 16 }} />
        )}

        <span onClick={() => onUserSelect(node)}>
          {node.userName}
        </span>
      </div>

      {expanded &&
        node.children.map(child => (
          <TreeNode
            key={child.userId}
            node={child}
            level={level + 1}
            selectedUserId={selectedUserId}
            onUserSelect={onUserSelect}
          />
        ))}
    </div>
  );
});

/* =========================
   PERFORMANCE PANEL
========================= */

function UserPerformancePanel({ user, filters, onFilterChange }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localFilters, setLocalFilters] = useState({
				  fromDate: filters.fromDate,
				  toDate: filters.toDate
				});


  useEffect(() => {
    setLoading(true);
    fetchUserPerformance(user.userId, filters)
      .then(setData)
      .finally(() => setLoading(false));
  }, [user, filters]);

  return (
    <>
      <h5 className="mb-3">
        Performance – {user.userName}
      </h5>

      {/* Filters */}
      <div className="row mb-3 g-2">
		  <div className="col-md-4">
			<label className="form-label">From Date</label>
			<input
			  type="date"
			  className="form-control"
			  value={localFilters.fromDate}
			  onChange={e => setLocalFilters(f => ({ ...f, fromDate: e.target.value }))}
			  max={localFilters.toDate}
			/>
		  </div>

		  <div className="col-md-4">
			<label className="form-label">To Date</label>
			<input
			  type="date"
			  className="form-control"
			  value={localFilters.toDate}
			  onChange={e => setLocalFilters(f => ({ ...f, toDate: e.target.value }))}
			  min={localFilters.fromDate}
			/>
		  </div>

		  <div className="col-md-4 d-flex align-items-end">
			<button
			  className="btn btn-primary w-100"
			  onClick={() => onFilterChange(localFilters)}
			>
			  Apply
			</button>
		  </div>
		</div>



      {/* Table */}
      {loading ? (
        <div>Loading performance...</div>
      ) : (
        data && (
		  <>
			{/* KPI */}
			<div className="mb-4">
			  <h6 className="text-muted">Visit → Sale Conversion</h6>
			  <h4>{(data.visitToSaleConversion * 100).toFixed(0)}%</h4>
			</div>

			<SiteVisitsTable visits={data.siteVisits} />
			<SalesTable sales={data.sales} />
			<ReceivableTable receivable={data.receivable} />
			<CommissionTable commission={data.commission} />
		  </>
		)

      )}
    </>
  );
}

/* =========================
   PERFORMANCE TABLE
========================= */

function PerformanceTable({ data }) {
  return (
    <table className="table table-bordered">
      <thead className="table-light">
        <tr>
          <th>Metric</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => (
          <tr key={row.metric}>
            <td>{row.metric}</td>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
