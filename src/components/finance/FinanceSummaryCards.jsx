import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import "./SummaryCards.css";
import { formatINRComma, formatINR } from "../../utils/numberFormatter";



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

const FinanceSummaryCards = ({ data, dateRange, onFilter }) => {
  const safeData = data ?? {};

  return (
    <Row className="mb-4 g-1">
      <Col md={2}>
        <SummaryCard
          title="Total Sales"
          value={formatINRComma(safeData.totalSaleAmount ?? 0)}
          variant="primary"
          onClick={() => onFilter?.({ type: "SALE" })}
        />
      </Col>

      <Col md={2}>
        <SummaryCard
          title="Total Receivable"
          value={formatINRComma(safeData.totalReceivable ?? 0)}
          variant="warning"
          onClick={() => onFilter?.({ type: "RECEIVABLE" })}
        />
      </Col>

      <Col md={2}>
        <SummaryCard
          title="Received"
          value={formatINRComma(safeData.receivedThisMonth ?? 0)}
          variant="success"
          onClick={() => onFilter?.({ type: "RECEIVED" })}
        />
      </Col>

      <Col md={2}>
        <SummaryCard
          title="Payout Done"
          value={formatINRComma(safeData.commissionPaidThisMonth ?? 0)}
          variant="info"
          onClick={() => onFilter?.({ type: "PAID" })}
        />
      </Col>

      <Col md={2}>
        <SummaryCard
          title="Payable"
          value={formatINRComma(safeData.commissionPayable ?? 0)}
          variant="danger"
          onClick={() => onFilter?.({ type: "PAYABLE" })}
        />
      </Col>
    </Row>
  );
};


export default FinanceSummaryCards;
