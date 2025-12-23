import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner, Badge } from "react-bootstrap";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import API from "../api/api";
import dayjs from "dayjs";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/api/dashboard")
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const { cards = [], charts = [], tables = [], meta } = data;

  /* ---------------- helpers ---------------- */

  const formatDate = (value) =>
    value ? dayjs(value).format("DD/MM/YYYY") : "-";

  const formatNumber = (value) =>
    typeof value === "number" ? value.toLocaleString() : value ?? "-";

  const getCardBg = (key) => {
    if (key.includes("SALE")) return "primary-subtle";
    if (key.includes("OUTSTANDING")) return "danger-subtle";
    if (key.includes("RECEIVED") || key.includes("PAID")) return "success-subtle";
    if (key.includes("COMMISSION")) return "warning-subtle";
    return "light";
  };

  const shouldRenderTable = (tableKey) => {
    if (tableKey === "INVENTORY_TABLE") return meta?.showInventory;
    if (tableKey === "RECEIVABLE_TABLE") return meta?.showReceivableTable;
    if (tableKey === "COMMISSION_PAYABLE_TABLE") return meta?.showCommissionTable;
    return true;
  };

  /* ---------------- render ---------------- */

  return (
    <Container fluid className="px-3 py-2">

      {/* ================= CARDS ================= */}
      <Row className="g-2 mb-4">
        {cards.map(card => (
          <Col
            key={card.key}
            xs={12}
            sm={6}
            md={4}
            lg={2}     // 6 cards per row
          >
            <Card
              className={`border-0 shadow-sm bg-${getCardBg(card.key)}`}
              style={{ borderRadius: "12px" }}
            >
              <Card.Body className="p-2 text-center">
                <div className="text-muted small fw-semibold">
                  {card.label}
                </div>
                <div className="fs-6 fw-bold mt-1">
                  ₹ {formatNumber(card.value)}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ================= CHARTS ================= */}
      <Row className="justify-content-center mb-5">
        {charts.map(chart => (
          <Col
            key={chart.key}
            xs={12}
            md={10}
            lg={6}   // reduced width + centered
            className="mb-4"
          >
            <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
              <Card.Body style={{ height: "320px" }}>
                <Card.Title className="mb-3 text-center">
                  {chart.key.replaceAll("_", " ")}
                </Card.Title>

                <ResponsiveContainer width="100%" height="85%">
                  {chart.type === "LINE" ? (
                    <LineChart data={chart.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={formatNumber} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#4e73df"
                        strokeWidth={2}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={chart.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={formatNumber} />
                      <Bar
                        dataKey="value"
                        fill="#1cc88a"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ================= TABLES ================= */}
      <Row>
        {tables
          .filter(table => shouldRenderTable(table.key))
          .map(table => (
            <Col key={table.key} xs={12} className="mb-4">
              <Card className="shadow-sm border-0" style={{ borderRadius: "12px" }}>
                <Card.Body className="p-3">
                  <Card.Title className="mb-3">
                    {table.key.replaceAll("_", " ")}
                  </Card.Title>

                  <div className="table-responsive">
                    <Table
                      hover
                      size="sm"
                      className="align-middle mb-0"
                      style={{ fontSize: "0.85rem" }}
                    >
                      <thead className="table-light small">
                        <tr>
                          {table.columns.map(col => (
                            <th key={col}>
                              {col.replaceAll("_", " ").toUpperCase()}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {table.rows.map((row, rowIdx) => (
                          <tr key={rowIdx}>
                            {table.columns.map(col => {
                              let value = row[col];
                              if (
                                col.toLowerCase().includes("date") ||
                                col.toLowerCase().includes("confirmed_at")
                              ) {
                                value = formatDate(value);
                              } else {
                                value = formatNumber(value);
                              }
                              return <td key={col}>{value}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>

    </Container>
  );
}