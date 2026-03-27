import React, { useEffect, useState } from "react";
import { Row, Col, Form, Button, Card } from "react-bootstrap";

const CASHFLOW_TYPES = [
	{ value: "", label: "All" },
	{ value: "RECEIVABLE", label: "Receivable" },
	{ value: "PAYABLE", label: "Payable" },
];

const CASHFLOW_STATUS = [
	{ value: "", label: "All" },
	{ value: "DUE", label: "Due" },
	{ value: "OVERDUE", label: "Overdue" },
	{ value: "PAID", label: "Paid" },
];

const startOfMonth = () => {
	const d = new Date();
	return new Date(d.getFullYear(), d.getMonth(), 1)
		.toISOString()
		.slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

const FinanceFilters = ({ value, onApply }) => {
  const [filters, setFilters] = useState(value);

  // keep local state in sync with parent
  useEffect(() => {
    setFilters(value);
  }, [value]);

  const update = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const apply = () => onApply?.(filters);

  const reset = () => {
    const defaults = {
      from: value.from,
      to: value.to,
      type: "",
      status: "",
    };
    setFilters(defaults);
    onApply?.(defaults);
  };

  return (
    <Card className="mb-1">
	  <Card.Body className="py-2">
		<Row className="align-items-center g-3 justify-content-center">

		  {/* FROM */}
		  <Col md="auto">
			<div className="d-flex align-items-center gap-2">
			  <Form.Label className="mb-0 small text-muted">From</Form.Label>
			  <Form.Control
				size="sm"
				type="date"
				name="from"
				value={filters.from || ""}
				onChange={update}
				style={{ width: "150px" }}
			  />
			</div>
		  </Col>

		  {/* TO */}
		  <Col md="auto">
			<div className="d-flex align-items-center gap-2">
			  <Form.Label className="mb-0 small text-muted">To</Form.Label>
			  <Form.Control
				size="sm"
				type="date"
				name="to"
				value={filters.to || ""}
				onChange={update}
				style={{ width: "150px" }}
			  />
			</div>
		  </Col>

		  {/* ACTIONS */}
		  <Col md="auto">
			<div className="d-flex gap-2">
			  <Button size="sm" variant="primary" onClick={apply}>
				Apply
			  </Button>
			  <Button size="sm" variant="outline-secondary" onClick={reset}>
				Reset
			  </Button>
			</div>
		  </Col>

		</Row>
	  </Card.Body>
	</Card>
  );
};


export default FinanceFilters;