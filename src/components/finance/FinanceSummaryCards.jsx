import React from "react";
import { Card, Row, Col } from "react-bootstrap";



const SummaryCard = ({ title, value, onClick, variant = "light" }) => (
	<Card
		bg={variant}
		text={variant === "light" ? "dark" : "white"}
		className="mb-3 cursor-pointer"
		onClick={onClick}
		style={{ cursor: "pointer" }}
	>
		<Card.Body>
			<Card.Title className="fs-6">{title}</Card.Title>
			<Card.Text className="fs-4 fw-bold">
				₹ {value?.toLocaleString() ?? 0}
			</Card.Text>
		</Card.Body>
	</Card>
);

const FinanceSummaryCards = ({ data, onFilter }) => {
	if (!data) return null;

	return (
		<Row className="mb-4">
			<Col md={3}>
				<SummaryCard
					title="Total Receivable"
					value={data.totalReceivable}
					variant="warning"
					onClick={() => onFilter?.({ type: "RECEIVABLE" })}
				/>
			</Col>

			<Col md={3}>
				<SummaryCard
					title="Received This Month"
					value={data.receivedThisMonth}
					variant="success"
				/>
			</Col>

			<Col md={3}>
				<SummaryCard
					title="Paid This Month"
					value={data.commissionPaidThisMonth}
					variant="info"
					onClick={() => onFilter?.({ status: "DUE" })}
				/>
			</Col>

			<Col md={3}>
				<SummaryCard
					title="Commission Payable"
					value={data.commissionPayable}
					variant="danger"
					onClick={() => onFilter?.({ type: "PAYABLE" })}
				/>
			</Col>
		</Row>
		

	);
};

export default FinanceSummaryCards;
