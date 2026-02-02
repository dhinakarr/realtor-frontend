import React, { useEffect, useState } from "react";
import { Row, Col, Button, Form } from "react-bootstrap";

const FinanceFilters = ({ dateRange, onApply }) => {
  const [localRange, setLocalRange] = useState(dateRange);

  useEffect(() => {
    setLocalRange(dateRange);
  }, [dateRange]);

  return (
    <Row className="align-items-end mb-3 g-2">
      <Col md={3}>
        <Form.Group>
          <Form.Label className="fw-semibold">From Date</Form.Label>
          <Form.Control
            type="date"
            value={localRange.from}
            onChange={(e) =>
              setLocalRange(r => ({ ...r, from: e.target.value }))
            }
          />
        </Form.Group>
      </Col>

      <Col md={3}>
        <Form.Group>
          <Form.Label className="fw-semibold">To Date</Form.Label>
          <Form.Control
            type="date"
            value={localRange.to}
            onChange={(e) =>
              setLocalRange(r => ({ ...r, to: e.target.value }))
            }
          />
        </Form.Group>
      </Col>

      <Col md="auto">
        <Button
          variant="primary"
          className="px-4"
          onClick={() => onApply(localRange)}
        >
          Apply
        </Button>
      </Col>
    </Row>
  );
};

export default FinanceFilters;
