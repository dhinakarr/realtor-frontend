import React, { useState } from "react";
import { Table, Spinner } from "react-bootstrap";
import { formatINRComma, formatINR } from "../../utils/numberFormatter";

const SaleDetailsTable = ({ data, loading, onAction }) => {
	
	if (loading) return <Spinner animation="border" />;

	if (!data?.length) {
		return <div className="text-muted">No Sales data found</div>;
	}
	
	const totals = data.reduce(
	  (acc, row) => {
		acc.saleAmount += Number(row.saleAmount || 0);
		acc.totalReceived += Number(row.totalReceived || 0);
		acc.outstandingAmount += Number(row.outstandingAmount || 0);
		return acc;
	  },
	  {
		saleAmount: 0,
		totalReceived: 0,
		outstandingAmount: 0,
	  }
	);
	
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
						<td className="text-end"> {formatINRComma(row.saleAmount)}</td>
						<td className="text-end"> {formatINRComma(row.totalReceived)}</td>
						<td className="fw-bold text-danger text-end">
							 {formatINRComma(row.outstandingAmount)}
						</td>
					</tr>
				))}
			</tbody>
			<tfoot>
			  <tr className="fw-bold">
				<td colSpan={4} className="text-end">Total</td>

				<td className="text-end">
				  {formatINRComma(Math.round(totals.saleAmount))}
				</td>

				<td className="text-end">
				  {formatINRComma(Math.round(totals.totalReceived))}
				</td>

				<td className="text-end text-danger">
				  {formatINRComma(Math.round(totals.outstandingAmount))}
				</td>

				<td></td>
			  </tr>
			</tfoot>
		</Table>
		
	);
};

export default SaleDetailsTable;
