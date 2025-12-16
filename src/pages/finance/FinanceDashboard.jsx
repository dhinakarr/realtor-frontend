import React, { useEffect, useState } from "react";
import FinanceSummaryCards from "../../components/finance/FinanceSummaryCards";
import FinanceFilters from "../../components/finance/FinanceFilters";
import CashFlowTable from "../../components/finance/CashFlowTable";
import PaymentDrawer from "../../components/finance/PaymentDrawer";
import PaymentModal from "../../components/PaymentModal";
import ReceivableDetailsTable from "../../components/finance/ReceivableDetailsTable";
import CommissionPayableTable from "../../components/finance/CommissionPayableTable";
import { getFinanceSummary, getCashFlow } from "../../api/financeApi";
import API from "../../api/api";
import { useToast } from "../../components/common/ToastProvider";

const FinanceDashboard = () => {

	const [summary, setSummary] = useState(null);
	const [rows, setRows] = useState([]);
	const [filters, setFilters] = useState({});
	const [drawer, setDrawer] = useState({ open: false });
	const { showToast } = useToast();
	const [viewType, setViewType] = useState("CASHFLOW"); 
// SUMMARY | RECEIVABLE | PAYABLE

	const [tableData, setTableData] = useState([]);
	const [loading, setLoading] = useState(false);
	const BASE_URL = API.defaults.baseURL;	
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [selectedPlotId, setSelectedPlotId] = useState(null);

	useEffect(() => {
		loadSummary();
		loadCashFlow();
	}, []);

	const loadSummary = async () => {
		const res = await getFinanceSummary();
		setSummary(res.data.data);
	};

	const loadCashFlow = async (f = filters) => {
		const res = await getCashFlow(f);
		setRows(res.data.data);
	};
	
	const handleAction = async (row, action) => {
	  try {	
		if (action === "VERIFY") {
			if (!window.confirm("Verify this payment? This cannot be undone.")) {
				return;
			}
			await verifyPayment(row.referenceId);
			showToast("Payment verified successfully", "success");
			loadSummary();
			loadCashFlow();
			return;
		}

		setDrawer({ open: true, row, action });
	  } catch {
		showToast("Failed to verify payment", "danger");
		}
		return;
	  
	};
	
	const handleFilter = async ({ type }) => {
		setLoading(true);

		try {
			let url = "";

			if (type === "RECEIVABLE") {
				url = "/api/finance/receivable/details";
			} else if (type === "PAYABLE") {
				url = "/api/finance/payable/details";
			}

			// Axios call (token already handled in API instance)
			const res = await API.get(url);

			// Axios response data
			const json = res.data;

			// Backend-level failure
			if (!json?.success) {
				showToast("API returned failure");
				throw new Error(json?.message || "API returned failure");
			}

			setTableData(json.data || []);
			setViewType(type);

		} catch (err) {
			showToast("Finance API error");
			console.error(
				"Finance API error:",
				err.response?.data || err.message
			);
		} finally {
			setLoading(false);
		}
	};

	const SectionHeader = ({ title, onBack }) => (
		<div className="d-flex justify-content-between align-items-center mb-3">
			<h4 className="mb-0">{title}</h4>
			<button
				className="btn btn-outline-secondary btn-sm"
				onClick={onBack}
			>
				← Back to Cash Flow
			</button>
		</div>
	);

	const onAction = (action, row ) => {
		//console.log("@FinanceDashbord row: "+JSON.stringify(row));
		if (action === "PAYMENT") {
			setSelectedPlotId(row.plotId);
			setShowPaymentModal(true);
		}
		
		if (action === "PAY_COMMISSION") {
			//setSelectedPlotId(row.plotId);
			//setShowPaymentModal(true);
			
			setDrawer({
				open: true,
				row,
				action: "PAY_COMMISSION"
			  });
		}

		if (action === "COMMENTS") {
			setDrawer({
				open: true,
				row,
				action: "COMMENTS"
			});
		}
	};
	
		const handlePaymentSubmit = async (payload) => {
			//console.log("handlePaymentSubmit payload: "+payload);
		  try {
			  const jsonData = {
				  paymentType: "PAID",
				  saleId: drawer.row.saleId,
				  amount: Number(drawer.row.commissionPayable), // already rounded
				  paidTo: drawer.row.agentId,                    // ✅ CRITICAL
				  paymentMode: formValues.paymentMode,
				  transactionRef: formValues.transactionRef,
				  remarks: formValues.remarks
				};
			  
			  console.log("handlePaymentSubmit paidTo: "+jsonData);
			//await API.post("/api/payments", jsonData);
			showToast("Payment saved successfully");
			setShowPaymentModal(false);	
			// optionally refresh payments list
		  } catch (err) {
			showToast("Failed to save payment");
		  }
		};

	return (
		<div className="p-4">
			<h2 className="text-xl font-semibold mb-4">Finance Operations</h2>

			<FinanceSummaryCards data={summary} onFilter={handleFilter} />

			{/* RECEIVABLE VIEW */}
			{viewType === "RECEIVABLE" && (
				<>
					<SectionHeader
						title="Receivable Details"
						onBack={() => setViewType("CASHFLOW")}
					/>
					<ReceivableDetailsTable
						data={tableData}
						loading={loading}
						onAction={onAction}
						
					/>
				</>
			)}

			{/* PAYABLE VIEW */}
			{viewType === "PAYABLE" && (
				<>
					<SectionHeader
						title="Commission Payable Details"
						onBack={() => setViewType("CASHFLOW")}
					/>
					<CommissionPayableTable
						data={tableData}
						loading={loading}
						onAction={onAction}
					/>
				</>
			)}

			{/* DEFAULT CASH FLOW VIEW */}
			{viewType === "CASHFLOW" && (
				<>
					<FinanceFilters
						onChange={(f) => {
							setFilters(f);
							loadCashFlow(f);
						}}
					/>

					<CashFlowTable
						rows={rows}
						onAction={(row, action) =>
							setDrawer({ open: true, row, action })
						}
					/>
				</>
			)}

			<PaymentDrawer
				open={drawer.open}
				row={drawer.row}
				action={drawer.action}
				onClose={() => setDrawer({ open: false })}
				onSuccess={() => {
					loadSummary();
					loadCashFlow();
					setDrawer({ open: false });
				}}
			/>
			
			<PaymentModal
			  open={showPaymentModal}
			  plotId={selectedPlotId}
			  onClose={() => setShowPaymentModal(false)}
			  onSubmit={handlePaymentSubmit}
			/>
			
		</div>
	);
};

export default FinanceDashboard;
