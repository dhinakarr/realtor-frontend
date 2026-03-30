import React, { useState } from "react";
import { Table, Spinner } from "react-bootstrap";
import { FaMoneyBillWave, FaCommentDots } from "react-icons/fa";
import useModule from "../../hooks/useModule";
import { formatINRComma, formatINR } from "../../utils/numberFormatter";

const ReceivableDetailsTable = ({ data, loading, onAction }) => {
	
  const featureUrl = "/api/site-visits";
  const module = useModule(featureUrl);
  const feature = module.features.find(f => f.url);
  const isFinance = (feature.financeRole == "FINANCE") ? true : false;
//console.log("ReceivableDetailsTable isFinance: ", isFinance);
	
	if (loading) return <Spinner animation="border" />;

	if (!data?.length) {
		return <div className="text-muted">No receivables found</div>;
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
	
	const ActionIcons = ({ row, onAction }) => (
		  <div className="d-flex justify-content-center gap-3">
		  {isFinance && (
			<FaMoneyBillWave
			  size={20}
			  style={{ cursor: "pointer" }}
			  onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				onAction("PAYMENT", row);
			  }}
			/>
		  )}
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
						<td className="text-end"> {formatINRComma(row.saleAmount)}</td>
						<td className="text-end"> {formatINRComma(row.totalReceived)}</td>
						<td className="fw-bold text-danger text-end">
							 {formatINRComma(row.outstandingAmount)}
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

export default ReceivableDetailsTable;
