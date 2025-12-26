import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Table } from "react-bootstrap";
import API from "../api/api";
import { useNavigate, useSearchParams } from "react-router-dom";


export default function InventoryDetails() {
  const [data, setData] = useState(null);
  const [params] = useSearchParams();
  const projectFilter = params.get("project");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/dashboard/inventory/details").then(res =>
      setData(res.data)
    );
  }, []);

  if (!data) return <Spinner />;

  const grouped = data.reduce((acc, row) => {
    if (projectFilter && row.projectName !== projectFilter) return acc;

    acc[row.projectName] = acc[row.projectName] || [];
    acc[row.projectName].push(row);
    return acc;
  }, {});

  return (
    <>
      {Object.entries(grouped).map(([project, rows]) => (
        <Card key={project} className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="align-items-center mb-3">
              <Col>
                <Card.Title>{project}</Card.Title>
              </Col>
              <Col className="text-end">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate("/dashboard")}
                >
                  Back to Dashboard
                </button>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col>Available: {rows.filter(r => r.inventoryStatus === "AVAILABLE").length}</Col>
              <Col>Booked: {rows.filter(r => r.inventoryStatus === "BOOKED").length}</Col>
              <Col>Sold: {rows.filter(r => r.inventoryStatus === "COMPLETED").length}</Col>
            </Row>
			
            <Table size="sm" hover>
              <thead>
                <tr>
                  <th>Plot</th>
                  <th>Area</th>
                  <th>Status</th>
                  <th>Price</th>
				  <th>Total Price</th>		
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.plotId}>
                    <td>{r.plotNumber}</td>
                    <td>{r.area}</td>		
                    <td>{r.inventoryStatus}</td>
                    <td>₹{r.basePrice}</td>
					<td>₹{r.totalPrice}</td>
                  </tr>
				  
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ))}
    </>
  );
}
