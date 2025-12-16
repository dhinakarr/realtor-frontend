import React, { useState } from "react";
import { Table, Button, Badge, Pagination } from "react-bootstrap";

const PAGE_SIZE = 10;

const statusVariant = {
	DUE: "warning",
	OVERDUE: "danger",
	PAID: "success",
	APPROVED: "info",
};

const CashFlowTable = ({ rows = [], onAction }) => {
	const [page, setPage] = useState(1);

	const totalPages = Math.ceil(rows.length / PAGE_SIZE);
	const pagedRows = rows.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE
	);

	const renderAction = (row) => {
		// Nothing allowed if already paid
		if (row.status === "PAID") {
			return <span className="text-muted">—</span>;
		}

		if (row.type === "RECEIVABLE") {
			return (
				<>
					<Button
						size="sm"
						variant="success"
						className="me-2"
						disabled={row.outstanding <= 0}
						onClick={() => onAction(row, "RECEIVE")}
					>
						Receive
					</Button>

					<Button
						size="sm"
						variant="outline-primary"
						disabled={row.verified}
						onClick={() => onAction(row, "VERIFY")}
					>
						Verify
					</Button>
				</>
			);
		}

		if (row.type === "PAYABLE") {
			return (
				<Button
					size="sm"
					variant="danger"
					disabled={row.amount <= 0}
					onClick={() => onAction(row, "PAY")}
				>
					Pay
				</Button>
			);
		}

		return null;
	};


	return (
		<>
			<Table striped bordered hover responsive>
				<thead>
					<tr>
						<th>Type</th>
						<th>Plot / Ref</th>
						<th>Party</th>
						<th>Amount</th>
						<th>Due Date</th>
						<th>Status</th>

					</tr>
				</thead>

				<tbody>
					{pagedRows.map((row, idx) => (
						<tr key={idx}>
							<td>{row.type}</td>
							<td>{row.plotNo}</td>
							<td>{row.partyName}</td>
							<td>₹ {row.amount.toLocaleString()}</td>
							<td>{row.dueDate}</td>
							<td>
								<Badge bg={statusVariant[row.status]}>
									{row.status}
								</Badge>
							</td>

						</tr>
					))}

					{pagedRows.length === 0 && (
						<tr>
							<td colSpan={7} className="text-center">
								No records found
							</td>
						</tr>
					)}
				</tbody>
			</Table>

			{totalPages > 1 && (
				<Pagination className="justify-content-end">
					<Pagination.Prev
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
					/>
					{[...Array(totalPages)].map((_, i) => (
						<Pagination.Item
							key={i}
							active={i + 1 === page}
							onClick={() => setPage(i + 1)}
						>
							{i + 1}
						</Pagination.Item>	
					))}
					<Pagination.Next
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}
					/>
				</Pagination>
			)}
		</>
	);
};

export default CashFlowTable;
