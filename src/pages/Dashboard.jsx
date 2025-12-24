import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import API from "../api/API";

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

  useEffect(() => {
    API.get("/api/dashboard/summary").then(res => setData(res.data));
  }, []);

  if (!data) return <Spinner animation="border" />;	
  
   

  /* ================= KPIs ================= */

  const totalCommission = sum(data.commissions, "totalCommission");

  
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

/* ================= VISIBILITY FLAGS ================= */
  const hasInventory = data.inventory?.length > 0;
  const hasFinance = data.finance?.length > 0 && Number(totalSales.replace(/,/g, "")) > 0;
  const hasAgents = data.agents?.length > 0;
  const hasCommissions = data.commissions?.length > 0 &&
								Number(totalCommission.replace(/,/g, "")) > 0;
  const hasVisits = data.siteVisits?.length > 0;

/* ================= Cards ================= */
	const StatCard = ({ title, value, bg }) => (
	  <Col md={2} lg={2} className="mb-2">
		<Card
		  className="border-0 shadow-sm"
		  style={{
			background: bg,
			color: "#fff",
			cursor: "pointer",
		  }}
		>
		  <Card.Body className="py-3 px-3">
			<div className="small opacity-75">{title}</div>
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
  
  const ChartBox = ({ children }) => (
	  <div style={{ height: "250px" }}>
		{children}
	  </div>
	);

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
        backgroundColor: ["#5c7cfa", "#ffa94d", "#9775fa", "#ff6b6b"],
      },
    ],
  };

  return (
    <>
		<p><h3>Dashboard </h3> </p>
      {/* ================= KPI CARDS ================= */}
      <Row className="mb-4">
		  {hasInventory && (
			<StatCard title="Total Plots" value={totalPlots} bg="#4dabf7" />
		  )}
		  {/* <StatCard title="Total Plots" value={totalPlots} bg="#4dabf7" />
			   <StatCard title="Available" value={availablePlots} bg="#51cf66" />
		  <StatCard title="Booked" value={bookedPlots} bg="#ffa94d" />
		  <StatCard title="Sold" value={soldPlots} bg="#ff6b6b" />*/}
			  {/*
		  <StatCard title="Sales Value" value={`₹${totalSales}`} bg="#339af0" /> 
		  <StatCard title="Received" value={`₹${totalReceived}`} bg="#20c997" />
		  <StatCard title="Outstanding" value={`₹${totalOutstanding}`} bg="#845ef7" />
			  */}
		  
		  {hasFinance && (
			<>
			  <StatCard title="Sales Value" value={`₹${totalSales.toLocaleString()}`} bg="#339af0" />
			  <StatCard title="Received" value={`₹${totalReceived}`} bg="#20c997" />
			  <StatCard title="Outstanding" value={`₹${totalOutstanding}`} bg="#845ef7" />
			</>
		  )}
		  {/*
		  <StatCard title="Site Visits" value={totalVisits} bg="#5c7cfa" />
		  <StatCard title="Conversion %" value={`${conversionRate}%`} bg="#15aabf" />
		  */}
		  {hasVisits && (
			<>
			  <StatCard title="Site Visits" value={totalVisits} bg="#5c7cfa" />
			  <StatCard title="Conversion %" value={`${conversionRate}%`} bg="#15aabf" />
			</>
		  )}
		</Row>


      {/* ================= ROW 1 ================= */}
      <Row className="g-4">
	  {/*
        <Col md={6}>
          <DashboardCard title="Inventory Status">
		    <ChartBox>
				<Bar data={inventoryChart} />
			</ChartBox>
          </DashboardCard>
		</Col>
	  */}
		{hasInventory && (
		  <Col md={6}>
			<DashboardCard title="Inventory Status">
			  <ChartBox>
				<Bar data={inventoryChart} />
			  </ChartBox>
			</DashboardCard>
		  </Col>
		)}
		
		{hasFinance && (
		  <Col md={6}>
			<DashboardCard title="Finance Overview">
			  <ChartBox>
				<Bar data={financeChart} options={{ maintainAspectRatio: false }} />
			  </ChartBox>
			</DashboardCard>
		  </Col>
		)}
		
		{/*
			<Col md={6}>
			  <DashboardCard title="Finance Overview">
				<ChartBox>
					<Bar data={financeChart} options={{ maintainAspectRatio: false }} />
				</ChartBox>
			  </DashboardCard>
			</Col>
		 </Row>
		*/}	
      

      {/* ================= ROW 2 ================= */}
      
	  {/* <Row>
        <Col md={6}>
          <DashboardCard title="Agent Performance">
		    <ChartBox>
				<Bar data={agentChart} />
			</ChartBox>
          </DashboardCard>
        </Col>
        <Col md={3}>
          <DashboardCard title="Commission Distribution">
		    <ChartBox>
				<Doughnut data={commissionChart} />
			</ChartBox>
          </DashboardCard>
        </Col>
	  */}
	  
	  {hasAgents && (
		<Col md={6}>
		  <DashboardCard title="Agent Performance">
			<ChartBox>
			  <Bar data={agentChart} />
			</ChartBox>
		  </DashboardCard>
		</Col>
	  )}

	  {hasCommissions && (
		<Col md={3}>
		  <DashboardCard title="Commission Distribution">
			<ChartBox>
			  <Doughnut data={commissionChart} />
			</ChartBox>
		  </DashboardCard>
		</Col>
	  )}
	  
      </Row>
    </>
  );
}

/* ================= UI COMPONENTS ================= */

const DashboardCard = ({ title, children }) => (
  <Card className="mb-4 shadow-sm border-0">
    <Card.Body>
      <Card.Title className="fw-semibold mb-3">{title}</Card.Title>
      {children}
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
  arr.reduce((a, b) => a + (b[key] || 0), 0).toLocaleString();
