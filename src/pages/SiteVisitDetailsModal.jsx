import React, { useState } from "react";
import { Modal, Table, Spinner } from "react-bootstrap";
import { formatINRComma, formatINR, formatDate } from "../utils/numberFormatter";
import "./Dashboard.css";

export default function SiteVisitDetailsModal({
		  open,
		  onClose,
		  data,
		  loading,
		}) {
	
	const [projectFilter, setProjectFilter] = useState("");
	const [agentFilter, setAgentFilter] = useState("");

	const filteredData = data.filter((row) => {
	  const matchesProject = row.projectName
		?.toLowerCase()
		.includes(projectFilter.toLowerCase());

	  const matchesAgent = row.agentName
		?.toLowerCase()
		.includes(agentFilter.toLowerCase());

	  return matchesProject && matchesAgent;
	});
	
	const projectOptions = [...new Set(data.map(d => d.projectName))];
	const agentOptions = [...new Set(data.map(d => d.agentName))];
	
  return (
    <Modal show={open} onHide={onClose} size="lg" centered dialogClassName="visit-modal-fixed">
      <Modal.Header closeButton>
        <Modal.Title>Site Visit Details</Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ overflowY: "auto" }}>
        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted">No data found</div>
        ) : (
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>
				<select
				  className="form-select form-select-sm"
				  value={projectFilter}
				  onChange={(e) => setProjectFilter(e.target.value)}
				>
				  <option value="">All Projects</option>
				  {projectOptions.map((p) => (
					<option key={p} value={p}>{p}</option>
				  ))}
				</select>
				</th>
                <th>
				<select
				  className="form-select form-select-sm"
				  value={agentFilter}
				  onChange={(e) => setAgentFilter(e.target.value)}
				>
				  <option value="">All Agents</option>
				  {agentOptions.map((a) => (
					<option key={a} value={a}>{a}</option>
				  ))}
				</select>
				</th>
                <th>Customer</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.siteVisitId + row.customerId}>
                  <td>{formatDate(row.visitDate)}</td>
                  <td>{row.projectName}</td>
                  <td>{row.agentName}</td>
                  <td>{row.customerName}</td>
                  <td>
                    {row.converted ? (
                      <span className="text-success fw-bold">
                        Converted
                      </span>
                    ) : (
                      <span className="text-muted">Not Converted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}