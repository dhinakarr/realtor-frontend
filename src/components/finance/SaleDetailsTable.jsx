import React, { useState } from "react";
import { Table, Spinner } from "react-bootstrap";

const SaleDetailsTable = ({ data, loading, onAction }) => {
	
	if (loading) return <Spinner animation="border" />;

	if (!data?.length) {
		return <div className="text-muted">No Sales data found</div>;
	}
	
	return (
		<Table striped bordered hover responsive>
			<thead>
				<tr>
					<th>Project</th>
					<th>Plot</th>
					<th>Customer</th>
					<th>Agent</th>
					<th>Sale Amount</th>
					<th>Received</th>
					<th>Outstanding</th>
				</tr>
			</thead>
			<tbody>
				{data.map((row) => (
					<tr key={row.saleId}>
						<td>{row.projectName}</td>
						<td>{row.plotNumber}</td>
						<td>{row.customerName}</td>
						<td>{row.agentName}</td>
						<td> {row.saleAmount.toLocaleString()}</td>
						<td> {row.totalReceived.toLocaleString()}</td>
						<td className="fw-bold text-danger">
							 {row.outstandingAmount.toLocaleString()}
						</td>
					</tr>
				))}
			</tbody>
		</Table>
		
	);
};

export default SaleDetailsTable;
