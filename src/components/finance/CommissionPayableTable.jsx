import { Table, Spinner } from "react-bootstrap";
import { FaMoneyBillWave, FaCommentDots } from "react-icons/fa";

const CommissionPayableTable = ({ data, loading, onAction }) => {
	if (loading) return <Spinner animation="border" />;

	if (!data || data.length === 0) {
		return <div className="text-muted">No payable commissions found</div>;
	}

	return (
		<Table striped bordered hover size="sm">
			<thead>
				<tr>
					<th>Project</th>
					<th>Plot</th>
					<th>Agent</th>
					<th className="text-end">Commission</th>
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
							₹ {(row.commissionEligible ?? 0).toLocaleString()}
						</td>
						<td className="text-end">
							₹ {(row.commissionPaid ?? 0).toLocaleString()}
						</td>
						<td className="text-end fw-bold text-danger">
							₹ {(row.commissionPayable ?? 0).toLocaleString()}
						</td>

						<td className="text-center">
							<div className="d-flex justify-content-center gap-3">
								<FaMoneyBillWave
									className={`cursor-pointer ${
										row.commissionPayable > 0
											? "text-success"
											: "text-muted"
									}`}
									title="Pay Commission"
									style={{ cursor: "pointer" }}
									onClick={() =>
										row.commissionPayable > 0 &&
										onAction("PAY_COMMISSION", row)
									}
								/>

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
		</Table>
	);
};

export default CommissionPayableTable;
