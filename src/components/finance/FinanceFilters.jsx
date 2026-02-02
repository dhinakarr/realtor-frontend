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
      <Card.Body  className="py-2">
        <Row className="align-items-end g-2">
          <Col md={3}>
            <Form.Group className="mb-1">
              <Form.Label className="mb-0 small text-muted">From</Form.Label>
              <Form.Control size="sm"
                type="date"
                name="from"
                value={filters.from || ""}
                onChange={update}
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group className="mb-1">
              <Form.Label className="mb-0 small text-muted">To</Form.Label>
              <Form.Control size="sm"
                type="date"
                name="to"
                value={filters.to || ""}
                onChange={update}
              />
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group className="mb-1">
              <Form.Label className="mb-0 small text-muted">Type</Form.Label>
              <Form.Select size="sm"
                name="type"
                value={filters.type || ""}
                onChange={update}
              >
                {CASHFLOW_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2}>
            <Form.Group className="mb-1">
              <Form.Label className="mb-0 small text-muted">Status</Form.Label>
              <Form.Select size="sm"
                name="status"
                value={filters.status || ""}
                onChange={update}
              >
                {CASHFLOW_STATUS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} className="d-flex gap-2 align-items-end">
            <Button size="sm" variant="primary" onClick={apply}>
              Apply
            </Button>
            <Button size="sm" variant="outline-secondary" onClick={reset}>
              Reset
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};


export default FinanceFilters;