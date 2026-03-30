import React from "react";
import { Table, Spinner } from "react-bootstrap";
import { FaMoneyBillWave, FaCommentDots } from "react-icons/fa";
import useModule from "../../hooks/useModule";
import { formatINRComma, formatINR } from "../../utils/numberFormatter";

const CommissionPayableTable = ({ data, loading, onAction }) => {
	
	const featureUrl = "/api/site-visits";
	const module = useModule(featureUrl);
	const feature = module.features.find(f => f.url);
	const isFinance = (feature.financeRole == "FINANCE") ? true : false;
	
	if (loading) return <Spinner animation="border" />;

	if (!data || data.length === 0) {
		return <div className="text-muted">No payable commissions found</div>;
	}
	
	const totals = data.reduce(
	  (acc, row) => {
		acc.commissionEligible += Number(row.commissionEligible || 0);
		acc.commissionPaid += Number(row.commissionPaid || 0);
		acc.commissionPayable += Number(row.commissionPayable || 0);
		return acc;
	  },
	  {
		commissionEligible: 0,
		commissionPaid: 0,
		commissionPayable: 0,
	  }
	);
	
	return (
		<Table striped bordered hover size="sm">
			<thead>
				<tr>
					<th>Project</th>
					<th>Plot</th>
					<th>Agent</th>
					<th className="text-end">Payout Eligible</th>
					<th className="text-end">Paid</th>
					<th className="text-end">Payable</th>
					<th className="text-center">Action</th>
				</tr>
			</thead>

			<tbody>
				{data.map((row) => (
					<tr key={`${row.saleId}-${row.agentId}`}>
						<td>{row.projectName}</td>
						<td>{row.plotNumber}</td>
						<td>{row.agentName}</td>

						<td className="text-end">
							 {formatINRComma(row.commissionEligible ?? 0)}
						</td>
						<td className="text-end">
							 {formatINRComma(row.commissionPaid ?? 0)}
						</td>
						<td className="text-end fw-bold text-danger">
							 {formatINRComma(row.commissionPayable ?? 0)}
						</td>

						<td className="text-center">
							<div className="d-flex justify-content-center gap-3">
							{isFinance && (
								<FaMoneyBillWave
									className={`cursor-pointer ${
										row.commissionPayable > 0
											? "text-success"
											: "text-muted"
									}`}
									title="Payout"
									style={{ cursor: "pointer" }}
									onClick={() =>
										row.commissionPayable > 0 &&
										onAction("PAY_COMMISSION", row)
									}
								/>
							)}
								<FaCommentDots
									className="text-primary cursor-pointer"
									title="Comments"
									style={{ cursor: "pointer" }}
									onClick={() =>
										onAction("COMMENTS", row)
									}
								/>
							</div>
						</td>
					</tr>
				))}
			</tbody>
			<tfoot>
			  <tr className="fw-bold">
				<td colSpan={3} className="text-end">Total</td>

				<td className="text-end">
				  {formatINRComma(Math.round(totals.commissionEligible))}
				</td>

				<td className="text-end">
				  {formatINRComma(Math.round(totals.commissionPaid))}
				</td>

				<td className="text-end text-danger">
				  {formatINRComma(Math.round(totals.commissionPayable))}
				</td>

				<td></td>
			  </tr>
			</tfoot>
		</Table>
	);
};

export default CommissionPayableTable;
