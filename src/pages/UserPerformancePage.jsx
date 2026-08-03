import React, { useEffect, useState, memo } from "react";
import API from "../api/api";
import { formatINRComma, formatINR, formatDate } from "../utils/numberFormatter";

/* =========================
   API FUNCTIONS
========================= */

async function fetchUserHierarchy() {
  const res = await API.get("/api/users/tree");

  const raw = res.data.data;

  const normalize = node => ({ 
    userId: node.userId ?? node.id,
    userName: node.userName ?? node.name,
	employeeId: node.employeeId ?? node.empId ?? null,
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
  
const totalExpense = visits.reduce(
  (sum, v) => sum + Number(v.expenseAmount || 0),
  0
);

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
              <td>{formatDate(v.visitDate)}</td>
              <td>{v.projectName}</td>
              <td>{v.customerName}</td>
              <td className="text-end">₹{formatINRComma(v.expenseAmount)}</td>
            </tr>
          ))}
        </tbody>
		<tfoot>
		  <tr>
			<th colSpan="3" className="text-end">Total</th>
			<th>₹{formatINRComma(totalExpense)}</th>
		  </tr>
		</tfoot>
      </table>
    </>
  );
}

const mapSaleStatus = (status) => {
  const map = {
    IN_PROGRESS: "BOOKED",
    COMPLETED: "SOLD"
  };

  return map[status] || status; // fallback to original
};

function SalesTable({ sales }) {
  if (!Array.isArray(sales) || sales.length === 0) return null;

	const totalSales = sales.reduce(
	  (sum, s) => sum + Number(s.saleAmount || 0),
	  0
	);  

  return (
    <>
      <h6 className="mt-4">Sales</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
		    <th>Project Name</th>
            <th>Plot</th>
            <th>Customer</th>
            <th>Plot Price</th>
            <th>Booked on</th>
			<th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(s => (
            <tr key={s.saleId}>
			  <td>{s.projectName}</td>
              <td>{s.plotNumber}</td>
              <td>{s.customerName}</td>
              <td className="text-end">₹{formatINRComma(s.saleAmount)}</td>
              <td>{formatDate(s.confirmedAt)}</td>
			  <td>{mapSaleStatus(s.saleStatus)}</td>
            </tr>
          ))}
        </tbody>
		
		<tfoot>
			  <tr>
				<th colSpan="3" className="text-end">Total</th>
				<th className="text-end">₹{formatINRComma(totalSales)}</th>
				<th></th>
				<th></th>
			  </tr>
			</tfoot>
		
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
		projectName: r.projectName,  
        plotNumber: r.plotNumber,
        customerName: r.customerName,
        saleAmount: r.saleAmount,
		baseAmount: r.baseAmount,
        received: 0
      };
      acc[key].received += r.totalReceived;
      return acc;
    }, {})
  );
  
  const totals = grouped.reduce(
	  (acc, r) => {
		acc.saleAmount += Number(r.saleAmount || 0);
		acc.received += Number(r.received || 0);
		acc.outstanding += Number((r.saleAmount - r.received) || 0);
		return acc;
	  },
	  { saleAmount: 0, received: 0, outstanding: 0 }
	);

  return (
    <>
      <h6 className="mt-4">Receivables</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
		    <th>Project</th>
            <th>Plot</th>
            <th>Customer</th>
            <th>Plot Price</th>
            <th>Received</th>
            <th>Outstanding</th>
          </tr>
        </thead>
        <tbody>
          {grouped.map(r => (
            <tr key={r.plotNumber}>
			  <td>{r.projectName}</td>
              <td>{r.plotNumber}</td>
              <td>{r.customerName}</td>
              <td className="text-end">₹{formatINRComma(r.saleAmount)}</td>
              <td className="text-end">₹{formatINRComma(r.received)}</td>
              <td className="text-end">₹{formatINRComma(r.saleAmount - r.received)}</td>
            </tr>
          ))}
        </tbody>
		<tfoot>
		  <tr>
			<th colSpan="3" className="text-end">Total</th>
			<th className="text-end">₹{formatINRComma(totals.saleAmount)}</th>
			<th className="text-end">₹{formatINRComma(totals.received)}</th>
			<th className="text-end">₹{formatINRComma(totals.outstanding)}</th>
		  </tr>
		</tfoot>
      </table>
    </>
  );
}

function CommissionTable({ commission, view }) {
  if (!commission?.length) return null;
  
  

const payables = commission.reduce(
  (acc, c) => {
    acc.saleAmount += Number(c.saleAmount || 0);
    acc.total += Number(c.totalCommission || 0);
    acc.paid += Number(c.commissionPaid || 0);
    return acc;
  },
  { saleAmount: 0, total: 0, paid: 0 }
);  
  return (
    <>
      <h6 className="mt-4">Payout</h6>
      <table className="table table-sm table-bordered">
        <thead>
          <tr>
            <th>Project</th>
			<th>Plot Number</th>
			<th>Member Name</th>
			<th>Sold By</th>
            <th>Plot Price</th>
            <th>Total Payout</th>
            <th>Paid</th>
          </tr>
        </thead>
        <tbody>
          {commission.map(c => (
            <tr key={c.commissionId}>
              <td>{c.projectName}</td>
			  <td>{c.plotNumber}</td>
			  <td>{c.agentName} </td>
			  <td>{c.sellerName} </td>
              <td className="text-end">₹{formatINRComma(c.saleAmount)}</td>
              <td className="text-end">₹{formatINRComma(c.totalCommission)}</td>
              <td className="text-success text-end">{formatINRComma(c.commissionPaid)}</td>
            </tr>
          ))}
        </tbody>
		
		<tfoot>
		  <tr>
			<th colSpan="4" className="text-end">Total</th>
			<th className="text-end">₹{formatINRComma(payables.saleAmount)}</th>
			<th className="text-end">₹{formatINRComma(payables.total)}</th>
			<th className="text-end">₹{formatINRComma(payables.paid)}</th>
		  </tr>
		</tfoot>
		
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

const INDENT = 16; // 👈 one level = 16px

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
        className={`d-flex align-items-center py-1 rounded ${
          selectedUserId === node.userId ? "bg-primary text-white" : "hover-bg"
        }`}
        style={{
          paddingLeft: level * INDENT,
          cursor: "pointer",
          position: "relative"
        }}
        onClick={() => onUserSelect(node)}
      >
        {/* vertical guide line */}
        {level > 0 && (
          <span
            style={{
              position: "absolute",
              left: level * INDENT - INDENT / 2,
              top: 0,
              bottom: 0,
              width: 1,
              backgroundColor: "#ddd"
            }}
          />
        )}

        {/* expand / collapse */}
        {hasChildren ? (
          <span
            onClick={e => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            style={{
              width: 14,
              textAlign: "center",
              marginRight: 6,
              fontWeight: 600
            }}
          >
            {expanded ? "▾" : "▸"}
          </span>
        ) : (
          <span style={{ width: 14, marginRight: 6 }} />
        )}

        <span>{node.userName} ({node.employeeId})</span>
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
  const commissionView = user ? "seller" : "member";

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
			<CommissionTable commission={data.commission} view={commissionView} />
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
