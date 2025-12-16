import React, { useState } from "react";
import { Table, Spinner } from "react-bootstrap";
import { FaMoneyBillWave, FaCommentDots } from "react-icons/fa";


const ReceivableDetailsTable = ({ data, loading, onAction }) => {

	
	if (loading) return <Spinner animation="border" />;

	if (!data?.length) {
		return <div className="text-muted">No receivables found</div>;
	}
	
	const ActionIcons = ({ row, onAction }) => (
		  <div className="d-flex justify-content-center gap-3">
			<FaMoneyBillWave
			  size={20}
			  style={{ cursor: "pointer" }}
			  onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onAction("PAYMENT", row);
			  }}
			/>

			<FaCommentDots
			  title="Customer Comments"
			  className="text-primary cursor-pointer"
			  style={{ cursor: "pointer" }}
			  onClick={() => onAction("COMMENTS", row)}
			/>
		  </div>
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
					<th className="text-center">Action</th>
				</tr>
			</thead>
			<tbody>
				{data.map((row) => (
					<tr key={row.saleId}>
						<td>{row.projectName}</td>
						<td>{row.plotNumber}</td>
						<td>{row.customerName}</td>
						<td>{row.agentName}</td>
						<td>₹ {row.saleAmount.toLocaleString()}</td>
						<td>₹ {row.totalReceived.toLocaleString()}</td>
						<td className="fw-bold text-danger">
							₹ {row.outstandingAmount.toLocaleString()}
						</td>
						<td className="text-center">
							<ActionIcons
								row={row}
								onAction={onAction}
							/>
						</td>
						
					</tr>
				))}
			</tbody>
		</Table>
		
	);
};

export default ReceivableDetailsTable;
