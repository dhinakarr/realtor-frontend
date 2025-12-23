import React, { useEffect, useState } from "react";
import { Form, Button, Row, Col, Spinner } from "react-bootstrap";
import API from "../../api/API";
import { useToast } from "../../components/common/ToastProvider";

export default function SiteVisitForm({ siteVisitId, onClose }) {
  const isEdit = Boolean(siteVisitId);
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const [agents, setAgents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState({
	  visitDate: "",
	  userId: "",
	  projectId: "",
	  customerIds: [],
	  vehicleType: "",
	  expenseAmount: 0,
	  remarks: ""
	});

  useEffect(() => {
    loadFormData();
    if (isEdit) load();
  }, [siteVisitId]);

  const loadFormData = async () => {
	  try {
		const res = await API.get("/api/site-visits/form-data");
		setAgents(res.data.agents);
		setProjects(res.data.projects);
		setCustomers(res.data.customers);
	  } catch {
		showToast("Failed to load form data", "danger");
	  }
	};

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/site-visits/${siteVisitId}`);
      setForm({
		  visitDate: res.data.visitDate,
		  userId: res.data.userId,
		  projectId: res.data.projectId,
		  customerIds: res.data.customers.map(c => c.customerId),
		  vehicleType: res.data.vehicleType || "",
		  expenseAmount: res.data.expenseAmount || 0,
		  remarks: res.data.remarks || ""
		});
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e) => {
    const values = Array.from(e.target.selectedOptions, o => o.value);
    setForm({ ...form, customerIds: values });
  };

  const save = async (submit) => {
    setValidated(true);

    if (!form.visitDate || !form.userId || !form.projectId || form.customerIds.length === 0) {
      showToast("Please fill all required fields", "warning");
      return;
    }
	
	const payload = {
		visitDate: form.visitDate,
		userId: form.userId,
		projectId: form.projectId,
		customerIds: form.customerIds,
		vehicleType: form.vehicleType,
		expenseAmount: form.expenseAmount,
		remarks: form.remarks
	  };

    setLoading(true);
    try {
      let id = siteVisitId;

      if (isEdit) {
        await API.patch(`/api/site-visits/${siteVisitId}`, payload);
      } else {
        const res = await API.post("/api/site-visits", payload);
        id = res.data.siteVisitId;
      }
      showToast(submit ? "Site visit submitted" : "Site visit saved");
      onClose();
    } catch {
      showToast("Unable to save site visit", "danger");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <Form noValidate validated={validated}>
      {/* Visit Date */}
      <Row className="mb-3">
        <Col>
          <Form.Label>Visit Date *</Form.Label>
          <Form.Control
            type="date"
            name="visitDate"
            value={form.visitDate}
            onChange={handleChange}
            required
          />
        </Col>
      </Row>

      {/* Agent */}
      <Row className="mb-3">
        <Col>
          <Form.Label>Agent *</Form.Label>
          <Form.Select
            name="userId"
            value={form.userId}
            onChange={handleChange}
            required
          >
            <option value="">Select Agent</option>
            {agents.map(a => (
              <option key={a.userId} value={a.userId}>
                {a.agentName}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Project */}
      <Row className="mb-3">
        <Col>
          <Form.Label>Project *</Form.Label>
          <Form.Select
            name="projectId"
            value={form.projectId}
            onChange={handleChange}
            required
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.projectId} value={p.projectId}>
                {p.projectName}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Customers */}
      <Row className="mb-3">
        <Col>
          <Form.Label>Customers *</Form.Label>
          <Form.Select
            multiple
            value={form.customerIds}
            onChange={handleCustomerChange}
          >
            {customers.map(c => (
              <option key={c.customerId} value={c.customerId}>
                {c.customerName}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>
	  <Form.Group>
		  <Form.Label>Vehicle Type</Form.Label>
		  <Form.Control name="vehicleType" value={form.vehicleType} onChange={handleChange}/>
		</Form.Group>

		<Form.Group>
		  <Form.Label>Expense Amount</Form.Label>
		  <Form.Control type="number" name="expenseAmount" value={form.expenseAmount} onChange={handleChange}/>
		</Form.Group>

      {/* Remarks */}
      <Row className="mb-3">
        <Col>
          <Form.Label>Remarks</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
          />
        </Col>
      </Row>

      {/* Actions */}
      <div className="d-flex justify-content-end">
        <Button variant="secondary" onClick={() => save(false)}>
          Save Draft
        </Button>{" "}
        <Button variant="primary" onClick={() => save(true)}>
          Submit
        </Button>
      </div>
    </Form>
  );
}
