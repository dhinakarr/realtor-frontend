import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import API from "../api/API";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

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
  const navigate = useNavigate();
  

  useEffect(() => {
	  API.get("/api/dashboard/summary")
		.then(res => setData(res.data))
		.catch(() => setData({
		  inventory: [],
			finance: [],
			agents: [],
			commissions: [],
			siteVisits: [],
			summaryKpis: {},
			actionKpis: {}
		}));
	}, []);


  if (!data) return <Spinner animation="border" />;	
  const summary = data.summaryKpis ?? {};
   

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
  const hasInventory = data.inventory?.length > 0;
  const hasFinance = data.finance?.length > 0 && totalSales > 0;
  const hasAgents = data.agents?.length > 0;
  const hasCommissions = data.commissions?.length > 0 && totalCommission > 0;
  const hasVisits = data.siteVisits?.length > 0;
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
    labels: data.inventory.map(p => p.projectName),
    datasets: [
      {
        label: "Available",
        data: data.inventory.map(p => p.available),
        backgroundColor: "#4dabf7",
      },
      {
        label: "Booked",
        data: data.inventory.map(p => p.booked),
        backgroundColor: "#ffa94d",
      },
      {
        label: "Sold",
        data: data.inventory.map(p => p.sold),
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
	  },
	};
  

  const financeChart = {
	  labels: data.finance.map(f => f.projectName),
	  datasets: [
		{
		  label: "Sales",
		  data: data.finance.map(f => f.totalSales),
		  backgroundColor: "#4dabf7",
		},
		{
		  label: "Received",
		  data: data.finance.map(f => f.totalReceived),
		  backgroundColor: "#ffa94d",
		},
		{
		  label: "Outstanding",
		  data: data.finance.map(f => f.totalOutstanding),
		  backgroundColor: "#ff6b6b",
		},
	  ],
	};


  const agentChart = {
    labels: data.agents.map(a => a.agentName),
    datasets: [
      {
        label: "Sales Value",
        data: data.agents.map(a => a.salesValue),
        backgroundColor: "#9775fa",
      },
    ],
  };

  const commissionChart = {
    labels: data.commissions.map(c => c.agentName),
    datasets: [
      {
        data: data.commissions.map(c => c.totalCommission),
        backgroundColor: ["#5c7cfa", "#ffa94d", "#9775fa", "#ff6b6b", 
		"#20c997", "#4dabf7", "#339af0", "#845ef7", "#51cf66"],
      },
    ],
  };

  return (
    <>
		<div className="d-flex justify-content-between align-items-center mb-3">
		  <h3 className="mb-0">Dashboard</h3>

		  <button
			className="btn btn-outline-primary btn-sm"
			onClick={() => navigate("/performance/users")}
		  >
			View Performance →
		  </button>
		</div>

      {/* ================= KPI CARDS ================= */}
      <Row className="mb-4 g-4">
		  {hasInventory && (
		  <>
			<StatCard title="Total Plots" value={totalPlots} 
				bg="#4dabf7" onClick={() => navigate("/dashboard/inventory")} />
			<StatCard title="Available" value={availablePlots} bg="#51cf66" />
			<StatCard title="Booked" value={bookedPlots} bg="#ffa94d" />
		  </>	
		  )}
		  {/* <StatCard title="Total Plots" value={totalPlots} bg="#4dabf7" />
			   <StatCard title="Available" value={availablePlots} bg="#51cf66" />
		  <StatCard title="Booked" value={bookedPlots} bg="#ffa94d" />
		  <StatCard title="Sold" value={soldPlots} bg="#ff6b6b" />*/}
		  {hasFinance && (
			<>
			  <StatCard title="Sales Value" value={`₹${totalSales.toLocaleString()}`} bg="#339af0" />
			  <StatCard title="Received" value={`₹${totalReceived.toLocaleString()}`} bg="#20c997" />
			  <StatCard title="Outstanding" value={`₹${totalOutstanding.toLocaleString()}`} bg="#845ef7" />
			</>
		  )}
		  {hasCommissions && (
			  <StatCard
				title="Total Commission"
				value={`₹${totalCommission.toLocaleString("en-IN")}`}
				bg="#845ef7"
			  />
			)}
		  {hasVisits && (
			<>
			  <StatCard title="Site Visits" value={totalSiteVisits} bg="#5c7cfa" />
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
		
		  <DashboardCard className="grid-item" title="Commission Distribution">
			<ChartBox>
			  <Doughnut data={commissionChart} options={chartOptions} />
			</ChartBox>
		  </DashboardCard>
		
	  )}
	  
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
  arr.reduce((a, b) => a + (b[key] || 0), 0);
