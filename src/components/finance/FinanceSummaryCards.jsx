import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import "./SummaryCards.css";



const SummaryCard = ({ title, value, onClick, variant = "dark" }) => (
	<Card
		bg={variant}
		text={variant === "light" ? "dark" : "white"}
		className={`summary-card summary-${variant}`}
		onClick={onClick}
		style={{ cursor: "pointer" }}
	>
		<Card.Body className="summary-body">
			<Card.Title className="summary-title">{title}</Card.Title>
			<Card.Text className="summary-value">
				₹ {value?.toLocaleString() ?? 0}
			</Card.Text>
		</Card.Body>
	</Card>
);

const FinanceSummaryCards = ({ data, onFilter }) => {
	if (!data) return null;

	return (
		<Row className="mb-4 g-1">
			<Col md={2}>
				<SummaryCard
					title="Total Sales"
					value={data.totalSaleAmount}
					variant="primary"
					onClick={() => onFilter?.({ type: "SALE" })}
				/>
			</Col>
			
			<Col md={2}>
				<SummaryCard
					title="Total Receivable"
					value={data.totalReceivable}
					variant="warning"
					onClick={() => onFilter?.({ type: "RECEIVABLE" })}
				/>
			</Col>

			<Col md={2}>
				<SummaryCard
					title="Received"
					value={data.receivedThisMonth}
					variant="success"
					onClick={() => onFilter({ type: "RECEIVED" })}
				/>
			</Col>

			<Col md={2}>
				<SummaryCard
					title="Paid This Month"
					value={data.commissionPaidThisMonth}
					variant="info"
					onClick={() => onFilter({ type: "PAID" })}
					
				/>
			</Col>

			<Col md={2}>
				<SummaryCard
					title="Payable"
					value={data.commissionPayable}
					variant="danger"
					onClick={() => onFilter?.({ type: "PAYABLE" })}
				/>
			</Col>
		</Row>
		

	);
};

export default FinanceSummaryCards;
