import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import API from "../api/API";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import { formatINRComma, formatINR } from "../utils/numberFormatter";
import ReceivableDetailsModal from "./ReceivableDetailsModal";
import CommissionDetailsModal from "./CommissionDetailsModal";
import SiteVisitDetailsModal from "./SiteVisitDetailsModal";

/* Chart.js registration */
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,		
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export default function DashboardSummary() {
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(null);
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [visitDetails, setVisitDetails] = useState([]);
  const [visitLoading, setVisitLoading] = useState(false);

	const fetchDashboard = (from, to) => {
	  setLoading(true);

	  API.get("/api/dashboard/summary", {
		params: {
		  from: from || null,
		  to: to || null,
		},
	  })
		.then((res) => setData(res.data.data))
		.catch(() =>
		  setData({
			inventory: [],
			finance: [],
			agents: [],
			commissions: [],
			siteVisits: [],
			summaryKpis: {},
			actionKpis: {},
		  })
		)
		.finally(() => setLoading(false));
	};

	useEffect(() => {
	  fetchDashboard();
	}, []);

  if (loading || !data) {
	  return (
		<div className="text-center mt-5">
		  <Spinner animation="border" />
		</div>
	  );
	}
  
  const fetchVisitDetails = () => {
	  setVisitLoading(true);

	  API.get("/api/dashboard/visit/details", {
		params: {
		  from: fromDate || null,
		  to: toDate || null,
		},
	  })
		.then((res) => {
		  setVisitDetails(res.data.data || []);
		  setVisitModalOpen(true);
		  //console.log("data: "+JSON.stringify(res.data.data));
		})
		.catch(() => {
		  setVisitDetails([]);
		  setVisitModalOpen(true);
		})
		.finally(() => setVisitLoading(false));
	};
  
  const summary = data.summaryKpis ?? {};
  
  const inventory = data.inventory || [];
  const finance = data.finance || [];
  const agents = data.agents || [];
  const commissions = data.commissions || [];
  const siteVisits = data.siteVisits || [];
  
  const handleApplyFilter = () => {
	  if (fromDate && toDate && fromDate > toDate) {
		alert("From date cannot be after To date");
		return;
	  }
//console.log("fromDate: "+fromDate+ ", toDate: "+toDate);
	  fetchDashboard(fromDate, toDate);
	};
   

  /* ================= KPIs ================= */

  const totalCommission = sum(data.commissions, "totalCommission");

  /*
  const totalPlots = data.inventory.reduce((a, p) => a + p.totalPlots, 0);
  const availablePlots = data.inventory.reduce((a, p) => a + p.available, 0);
  const bookedPlots = data.inventory.reduce((a, p) => a + p.booked, 0);
  const soldPlots = data.inventory.reduce((a, p) => a + p.sold, 0);

  const totalSales = sum(data.finance, "totalSales");
  const totalReceived = sum(data.finance, "totalReceived");
  const totalOutstanding = sum(data.finance, "totalOutstanding");

  const totalVisits = sum(data.siteVisits, "totalVisits");
  const totalConversions = sum(data.siteVisits, "conversions");
  const conversionRate = totalVisits
						? ((totalConversions / totalVisits) * 100).toFixed(1)
							: 0;
*/

	const {
	  totalPlots = 0,
	  availablePlots = 0,
	  bookedPlots = 0,
	  soldPlots = 0,
	  totalSales = 0,
	  totalReceived = 0,
	  totalOutstanding = 0,
	  totalSiteVisits = 0,
	  avgConversionRatio = 0,
	  totalCommissionPayable = 0,
	} = summary;

/* ================= VISIBILITY FLAGS ================= */
  const hasInventory = inventory?.length > 0;
  const hasFinance = finance?.length > 0 && totalSales > 0;
  const hasAgents = agents?.length > 0;
  const hasCommissions = commissions?.length > 0 && totalCommission > 0;
  const hasVisits = siteVisits?.length > 0;
  
 /* 
  const inventoryChart = data.inventory?.length
						  ? {
							  labels: data.inventory.map(p => p.projectName),
							  datasets: [...]
							}
						  : null;
  const hasFinance = totalSales > 0;	
  const hasCommissions = totalCommissionPayable > 0;
  const hasVisits = totalSiteVisits > 0;
  const hasAgents = data.agents?.length > 0;*/

/* ================= Cards ================= */
	const StatCard = ({ title, value, bg, onClick }) => (
	  <Col xs={6} sm={4} md={3} lg={2} className="d-flex">
		<Card
		  className="border-0 shadow-sm flex-fill"
		  style={{
			background: bg,
			color: "#fff",
			cursor: onClick ? "pointer" : "default",
		  }}
		  onClick={onClick}
		>
		  <Card.Body className="py-1 px-2 text-center">
			<div className="fw-bold opacity-75">{title}</div>
			<div className="fw-bold fs-5">{value}</div>
		  </Card.Body>
		</Card>
	  </Col>
	);

  /* ================= Charts ================= */

  const inventoryChart = {
    labels: inventory.map(p => p.projectName),
    datasets: [
      {
        label: "Available",
        data: inventory.map(p => p.available),
        backgroundColor: "#4dabf7",
      },
      {
        label: "Booked",
        data: inventory.map(p => p.booked),
        backgroundColor: "#ffa94d",
      },
      {
        label: "Sold",
        data: inventory.map(p => p.sold),
        backgroundColor: "#ff6b6b",	
      },
    ],
  };
  
  const ChartBox = ({ children, height = 250 }) => (
	  <div className="chart-box" style={{ height }}>
		{children}
	  </div>
	);
  
	const chartOptions = {
	  responsive: true,
	  maintainAspectRatio: false,
	  plugins: {
		legend: {
		  position: "bottom",
		},
		tooltip: {
		  callbacks: {
			label: function (context) {
			  const dataset = context.dataset;
			  const value = context.raw;
			  const format = dataset.format;
			  const label =
				context.chart.data.labels?.[context.dataIndex] || // doughnut
				dataset.label ||                                 // bar/line
				"";

			  switch (format) {
				case "currency":
				  return `${label}: ₹${formatINRComma(value)}`;
				case "area":
				  return `${label}: ${value.toLocaleString()} sqft`;
				default:
				  return `${label}: ${value}`;
			  }
			}
		  }
		}
	  },
	  scales: {
		y1: {
		  display: false,
		},
		y2: {
		  display: false,
		},
		y3: {
		  display: true,
		},
	  },
	};
  

  const financeChart = {
	  labels: finance.map(f => f.projectName),
	  datasets: [
		{
		  label: "Sales",
		  data: finance.map(f => f.totalSales),
		  backgroundColor: "#4dabf7",
		  format: "currency",
		},
		{
		  label: "Received",
		  data: finance.map(f => f.totalReceived),
		  backgroundColor: "#ffa94d",
		  format: "currency",
		},
		{
		  label: "Outstanding",
		  data: finance.map(f => f.totalOutstanding),
		  backgroundColor: "#ff6b6b",
		  format: "currency",
		},
	  ],
	};


  const agentChart = {
	  labels: agents.map(a => a.agentName),
	  datasets: [
		{
		  label: "Sales Value",
		  data: agents.map(a => a.salesValue),
		  backgroundColor: "#9775fa",
		  yAxisID: "y1",
		  format: "currency",
		},
		{
		  label: "Total Area",
		  data: agents.map(a => a.totalArea),
		  backgroundColor: "#ffa94d",
		  yAxisID: "y2",
		  format: "area",
		},
		{
		  label: "Total Sales",
		  data: agents.map(a => a.totalSales),
		  backgroundColor: "#51cf66",
		  yAxisID: "y3",
		  format: "count",
		},
	  ],
	};

  const commissionChart = {
    labels: commissions.map(c => c.agentName),
    datasets: [
      {
		data: commissions.map(c => c.totalCommission),
        backgroundColor: ["#5c7cfa", "#ffa94d", "#9775fa", "#ff6b6b", 
		"#20c997", "#4dabf7", "#339af0", "#845ef7", "#51cf66"],
		format: "currency",
      },
    ],
  };

  return (
    <>
		<div className="d-flex justify-content-between align-items-center mb-3">
		  <h3 className="mb-0">Dashboard</h3>
		  
		  <div className="d-flex gap-3 align-items-center mb-3 flex-wrap">

			  <div className="d-flex align-items-center gap-2">
				<label className="mb-0">From</label>
				<input
				  type="date"
				  className="form-control form-control-sm"
				  value={fromDate}
				  onChange={(e) => setFromDate(e.target.value)}
				  style={{ width: "150px" }}
				/>
			  </div>

			  <div className="d-flex align-items-center gap-2">
				<label className="mb-0">To</label>
				<input
				  type="date"
				  className="form-control form-control-sm"
				  value={toDate}
				  onChange={(e) => setToDate(e.target.value)}
				  style={{ width: "150px" }}
				/>
			  </div>

			  <button
				className="btn btn-primary btn-sm"
				onClick={handleApplyFilter}
			  >
				Apply
			  </button>

			  <button
				className="btn btn-outline-secondary btn-sm"
				onClick={() => {
				  setFromDate("");
				  setToDate("");
				  fetchDashboard();
				}}
			  >
				Reset
			  </button>

			</div>

		  <button
			className="btn btn-outline-primary btn-sm"
			onClick={() => navigate("/performance/users")}
		  >
			View Performance →
		  </button>
		</div>

      {/* ================= KPI CARDS ================= */}
      <Row className="mb-4 g-4">
	  {/*
		  {hasInventory && (
		  <>
			<StatCard title="Total Plots" value={totalPlots} 
				bg="#4dabf7" onClick={() => navigate("/dashboard/inventory")} />
			<StatCard title="Available" value={availablePlots} bg="#51cf66" />
			<StatCard title="Booked" value={bookedPlots} bg="#ffa94d" />
		  </>	
		  )}
		   <StatCard title="Total Plots" value={totalPlots} bg="#4dabf7" />
			   <StatCard title="Available" value={availablePlots} bg="#51cf66" />
		  <StatCard title="Booked" value={bookedPlots} bg="#ffa94d" />
		  <StatCard title="Sold" value={soldPlots} bg="#ff6b6b" />*/}
		  {hasFinance && (
			<>
			  <StatCard title="Sales Value" 
				value={`₹${formatINRComma(totalSales)}`} 
				bg="#339af0" 
				onClick={() => {
					setType("sales");
					setOpen(true);
				  }}
			  />
			  <StatCard 
				title="Received" 
				value={`₹${formatINRComma(totalReceived)}`} 
				bg="#20c997" 
				onClick={() => {
					setType("received");
					setOpen(true)
				}
					} />
			  <StatCard 
				title="Outstanding" 
				value={`₹${formatINRComma(totalOutstanding)}`} 
				bg="#845ef7" 
				onClick={() => {
					setType("outstanding");
					setOpen(true);
				  }}
			  />
			</>
		  )}
		  {hasCommissions && (
			  <StatCard
				title="Total Payout"
				value={`₹${formatINRComma(totalCommission)}`}
				bg="#51cf66"
				onClick={() => setCommissionModalOpen(true)}
			  />
			)}
		  {hasVisits && (
			<>
			  <StatCard
				  title="Site Visits"
				  value={totalSiteVisits}
				  bg="#5c7cfa"
				  onClick={fetchVisitDetails}
				/>
			  <StatCard title="Conversion %" value={`${avgConversionRatio}%`} bg="#15aabf" />
			</>
		  )}
		</Row>


      {/* ================= ROW 1 ================= */}
      <div className="dashboard-grid">
		{hasInventory && (
		  
			<DashboardCard className="grid-item" title="Inventory Status">
			  <ChartBox>
				  <Bar data={inventoryChart} options={chartOptions} />
			  </ChartBox>
			</DashboardCard>
		  
		)}
		
		{hasFinance && (
		 
			<DashboardCard className="grid-item" title="Finance Overview">
			  <ChartBox>
				<Bar data={financeChart} options={chartOptions} />
			  </ChartBox>
			</DashboardCard>
		 
		)}

      {/* ================= ROW 2 ================= */}
	  {hasAgents && (
		
		  <DashboardCard className="grid-item" title="Agent Performance">
			<ChartBox>
			  <Bar data={agentChart} options={chartOptions} />
			</ChartBox>
		  </DashboardCard>
		
	  )}

	  {hasCommissions && (
		
		  <DashboardCard className="grid-item" title="Payout Distribution">
			<ChartBox>
			  <Doughnut data={commissionChart} options={chartOptions} />
			</ChartBox>
		  </DashboardCard>
		
	  )}
	  
	  <ReceivableDetailsModal
		  open={open}
		  onClose={() => setOpen(false)}
		  from={fromDate}
		  to={toDate}
		  type={type}
		/>
		
		<CommissionDetailsModal
		  open={commissionModalOpen}
		  onClose={() => setCommissionModalOpen(false)}
		  from={fromDate}
		  to={toDate}
		/>
		
		<SiteVisitDetailsModal
		  open={visitModalOpen}
		  onClose={() => setVisitModalOpen(false)}
		  data={visitDetails}
		  loading={visitLoading}
		/>
	  
      </div>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

const DashboardCard = ({ title, children, className = "" }) => (
  <Card className={`shadow-sm border-0 h-100 ${className}`}>
    <Card.Body className="d-flex flex-column">
      <Card.Title className="fw-semibold mb-3">{title}</Card.Title>
	  <div className="flex-grow-1">
      {children}
	  </div>
    </Card.Body>
  </Card>
);

const Kpi = ({ title, value }) => (
  <Col md={3}>
    <Card className="shadow-sm border-0 text-center">
      <Card.Body>
        <div className="text-muted small">{title}</div>
        <h4 className="fw-bold mt-1">{value}</h4>
      </Card.Body>
    </Card>
  </Col>
);

const sum = (arr, key) =>
  (arr || []).reduce((a, b) => a + (b[key] || 0), 0);

