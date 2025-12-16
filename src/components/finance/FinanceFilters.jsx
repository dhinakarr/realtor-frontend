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

const FinanceFilters = ({ onApply }) => {
	const [filters, setFilters] = useState({
		from: startOfMonth(),
		to: today(),
		type: "",
		status: "",
	});

	useEffect(() => {
		onApply?.(filters); // initial load
	}, []);

	const update = (e) => {
		setFilters({ ...filters, [e.target.name]: e.target.value });
	};

	const apply = () => onApply?.(filters);

	const reset = () => {
		const defaults = {
			from: startOfMonth(),
			to: today(),
			type: "",
			status: "",
		};
		setFilters(defaults);
		onApply?.(defaults);
	};

	return (
		<Card className="mb-3">
			<Card.Body>
				<Row className="align-items-end">
					<Col md={3}>
						<Form.Group>
							<Form.Label>From</Form.Label>
							<Form.Control
								type="date"
								name="from"
								value={filters.from}
								onChange={update}
							/>
						</Form.Group>
					</Col>

					<Col md={3}>
						<Form.Group>
							<Form.Label>To</Form.Label>
							<Form.Control
								type="date"
								name="to"
								value={filters.to}
								onChange={update}
							/>
						</Form.Group>
					</Col>

					<Col md={2}>
						<Form.Group>
							<Form.Label>Type</Form.Label>
							<Form.Select
								name="type"
								value={filters.type}
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
						<Form.Group>
							<Form.Label>Status</Form.Label>
							<Form.Select
								name="status"
								value={filters.status}
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

					<Col md={2} className="d-flex gap-2">
						<Button variant="primary" onClick={apply}>
							Apply
						</Button>
						<Button variant="outline-secondary" onClick={reset}>
							Reset
						</Button>
					</Col>
				</Row>
			</Card.Body>
		</Card>
	);
};

export default FinanceFilters;
