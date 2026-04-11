import React, { useEffect, useState } from "react";
import { Modal, Table, Spinner, Form } from "react-bootstrap";
import API from "../api/api";
import { formatINRComma } from "../utils/numberFormatter";
import "./Dashboard.css";

export default function CommissionDetailsModal({ open, onClose, from, to }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    project: "",
    plot: "",
    agent: ""
  });

  useEffect(() => {
    if (open) {
      setLoading(true);
      API.get("/api/dashboard/commission/details", { params: { from, to } })
        .then((res) => {
			setList(res.data.data)
			//console.log("Data: "+JSON.stringify(res.data.data));
		})
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [open, from, to]);
  
  const getUniqueValues = (key) => {
    return [...new Set(list.map(item => item[key]))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  };
  
  // 2. Logic to filter the list based on user input
  const filteredList = list.filter((item) => {
    return (
      (filters.project === "" || item.projectName === filters.project) &&
      (filters.plot === "" || item.plotNumber === filters.plot) &&
      (filters.agent === "" || item.agentName === filters.agent)
    );
  });
  
  // Calculate Totals
  const totals = filteredList.reduce(
    (acc, item) => {
      acc.sale += item.saleAmount || 0;
      acc.comm += item.totalCommission || 0;
      acc.paid += item.commissionPaid || 0;
      acc.payable += item.commissionPayable || 0;
      return acc;
    },
    { sale: 0, comm: 0, paid: 0, payable: 0 }
  );
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal show={open} onHide={onClose} size="xl" scrollable centered>
      <Modal.Header closeButton>
        <Modal.Title>Payout Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center"><Spinner animation="border" /></div>
        ) : (
          <Table responsive striped bordered hover className="small">
            <thead className="table-dark">
              <tr>
                <th>
				<Form.Select 
                      size="sm" 
                      name="project" 
                      value={filters.project} 
                      onChange={handleFilterChange}
                      className="mt-1 bg-dark text-white border-secondary border-1"
                    >
                      <option value="">All Projects</option>
                      {getUniqueValues("projectName").map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </Form.Select>
				</th>
                <th>
                    <Form.Select 
                      size="sm" 
                      name="plot" 
                      value={filters.plot} 
                      onChange={handleFilterChange}
                      className="mt-1 bg-dark text-white border-secondary border-1"
                    >
                      <option value="">All Plots</option>
                      {getUniqueValues("plotNumber").map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </Form.Select>
				</th>
				<th>
                    <Form.Select 
                      size="sm" 
                      name="agent" 
                      value={filters.agent} 
                      onChange={handleFilterChange}
                      className="mt-1 bg-dark text-white border-secondary border-1"
                    >
                      <option value="">Payout To</option>
                      {getUniqueValues("agentName").map(val => (
                        <option key={val} value={val}>{val}</option>
                      ))}
                    </Form.Select>
				</th>
                <th>Sale Value</th>
                <th>Total Payout</th>
                <th>Paid</th>
                <th>Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, index) => (
                <tr key={index}>
                  <td>{item.projectName}</td>
                  <td>{item.plotNumber}</td>
				  <td>{item.agentName}</td>
                  <td className="text-end">₹{formatINRComma(item.saleAmount)}</td>
                  <td className="text-end">₹{formatINRComma(item.totalCommission)}</td>
                  <td className="text-end">₹{formatINRComma(item.commissionPaid)}</td>
                  <td className="fw-bold text-danger text-end">₹{formatINRComma(item.commissionPayable)}</td>
                </tr>
              ))}
            </tbody>
			{/* Totals Footer */}
              <tfoot className="table-light sticky-bottom fw-bold border-top" style={{ zIndex: 1, bottom: 0 }}>
                <tr>
                  <td colspan="3">TOTALS</td>
                  <td className="text-end text-primary">₹{formatINRComma(totals.sale)}</td>
                  <td className="text-end text-primary">₹{formatINRComma(totals.comm)}</td>
                  <td className="text-end text-success">₹{formatINRComma(totals.paid)}</td>
                  <td className="text-end text-danger">₹{formatINRComma(totals.payable)}</td>
                </tr>
              </tfoot>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
}