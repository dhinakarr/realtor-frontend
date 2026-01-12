import React, { useEffect, useState } from "react";
import FinanceSummaryCards from "../../components/finance/FinanceSummaryCards";
import FinanceFilters from "../../components/finance/FinanceFilters";
import CashFlowTable from "../../components/finance/CashFlowTable";
import PaymentDrawer from "../../components/finance/PaymentDrawer";
import PaymentModal from "../../components/PaymentModal";
import CommentsOverlay from '../../pages/customers/CommentsOverlay';
import ReceivableDetailsTable from "../../components/finance/ReceivableDetailsTable";
import CommissionPayableTable from "../../components/finance/CommissionPayableTable";
import { getFinanceSummary, getCashFlow } from "../../api/financeApi";
import API from "../../api/api";
import { useToast } from "../../components/common/ToastProvider";
import SaleDetailsTable from "../../components/finance/SaleDetailsTable";
import TransactionHistoryModal from "../../components/finance/TransactionHistoryModal";
import { Table, Modal } from "react-bootstrap";

const FinanceDashboard = () => {

	const [summary, setSummary] = useState(null);
	const [rows, setRows] = useState([]);
	const [filters, setFilters] = useState({});
	const [drawer, setDrawer] = useState({ open: false });
	const { showToast } = useToast();
	const [viewType, setViewType] = useState("CASHFLOW"); 
	//const [showTable, setShowTable] = useState(false);
// SUMMARY | RECEIVABLE | PAYABLE

	const [tableData, setTableData] = useState([]);
	const [loading, setLoading] = useState(false);
	const BASE_URL = API.defaults.baseURL;	
	const [showPaymentModal, setShowPaymentModal] = useState(false);
	const [selectedPlotId, setSelectedPlotId] = useState(null);
	const [showCommentsOverlay, setShowCommentsOverlay] = useState(false);
	const [selectedCustomerId, setSelectedCustomerId] = useState(null);
	const [selectedOutstanding, setSelectedOutstanding] = useState(0);
	
	const [showTxnModal, setShowTxnModal] = useState(false);
	const [saleId, setSaleId] = useState(null);
	const [txnType, setTxnType] = useState(null);
	const [agentId, setAgentId] = useState(null);

	useEffect(() => {
		loadSummary();
		loadCashFlow();
	}, []);
	
	const handleAmountClick = (saleId, txnType, agentId = null) => {
	  setSaleId(saleId);
	  setTxnType(txnType);
	  setAgentId(agentId);
	  setShowTxnModal(true);
	};
	
	const loadSummary = async () => {
		const res = await getFinanceSummary();
		setSummary(res.data.data);
	};

	const loadCashFlow = async (f = filters) => {
		const res = await getCashFlow(f);
		setRows(res.data.data);
	};
	
	const handleCashflowAction = async (row, action) => {
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
		let url;

		switch (type) {
		  case "RECEIVED":
			url = "/api/finance/received/details";
			break;

		  case "PAID":
			url = "/api/finance/paid/details";
			break;

		  case "SALE":
			url = "/api/finance/sale/details";
			break;

		  case "RECEIVABLE":
			url = "/api/finance/receivable/details";
			break;

		  case "PAYABLE":
			url = "/api/finance/payable/details";
			break;

		  default:
			throw new Error(`Unknown filter type: ${type}`);
		}

		const res = await API.get(url);
		const json = res.data;

		if (!json?.success) {
		  throw new Error(json?.message || "API returned failure");
		}

		setTableData(json.data || []);
		setViewType(type);
		

	  } catch (err) {
		showToast("Finance API error");
		console.error("Finance API error:", err.message);
	  } finally {
		setLoading(false);
	  }
	};

	
	const columnsByType = {
	  RECEIVED: [
		{ key: "projectName", label: "Project" },
		{ key: "plotNumber", label: "Plot" },
		{ key: "customerName", label: "Customer" },
		{ key: "agentName", label: "Agent" },
		{ key: "saleAmount", label: "Sale Amount" },
		{
		  key: "totalReceived",
		  label: "Received",
		  isAmount: true,
		  clickable: true,
		  txnType: "RECEIVED"
		},
		{ key: "outstandingAmount", label: "Outstanding" }
	  ],

	  PAID: [
		{ key: "projectName", label: "Project" },
		{ key: "plotNumber", label: "Plot" },
		{ key: "agentName", label: "Agent" },
		{ key: "saleAmount", label: "Sale Amount" },
		{ key: "paymentDate", label: "Paid Date" },
		{ key: "totalCommission", label: "Commission" },
		{
		  key: "commissionPaid",
		  label: "Paid",
		  isAmount: true,
		  clickable: true,
		  txnType: "PAID"
		},
		{
		  key: "commissionPayable",
		  label: "Commission",
		  isAmount: true,
		  txnType: "PAID"
		}
	  ]
	};
	
	const formatAmount = (value) => {
	  if (value == null || isNaN(value)) return "₹0.00";

	  return Number(value).toLocaleString("en-IN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	  });
	};


	const FinanceDetailsTable = ({ type, data, onAmountClick }) => {
	  const columns = columnsByType[type];

	  if (!columns) {
		return <div className="text-muted">No table configuration</div>;
	  }

	  return (
		<Table striped bordered hover size="sm">
		  <thead>
			<tr>
			  {columns.map(col => (
				<th key={col.key}>{col.label}</th>
			  ))}
			</tr>
		  </thead>
		  <tbody>
			{data.map((row, idx) => (
			  <tr key={idx}>
				{columns.map(col => (
				  <td key={col.key}>
				  {col.clickable && col.isAmount && onAmountClick ? (
					  <span
						className="fw-semibold text-primary"
						style={{ cursor: "pointer", textDecoration: "underline" }}
						onClick={() =>
						  onAmountClick(row.saleId, col.txnType, row.agentId)
						}
					  >
						{formatAmount(row[col.key])}
					  </span>
					) : col.isAmount ? (
					  formatAmount(row[col.key])
					) : (
					  row[col.key] ?? "-"
					)}

				</td>


				))}
			  </tr>
			))}
		  </tbody>
		</Table>
	  );
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

	const handleTableAction = (action, row ) => {
		//console.log("@FinanceDashbord row: "+JSON.stringify(row));
		if (action === "PAYMENT") {
			setSelectedPlotId(row.plotId);
			setSelectedOutstanding(Number(row.outstandingAmount || 0));
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
			/*
			setDrawer({
				open: true,
				row,
				action: "COMMENTS"
			});
			*/
			setSelectedCustomerId(row.customerId);
			setShowCommentsOverlay(true);
		}
	};
	
	const submitReceivablePayment = async (payload) => {
		
	  const json = buildPaymentPayload(payload, "RECEIVABLE");
	  await API.post("/api/payments", json);
	  setShowPaymentModal(false);
	  showToast("Payment saved successfully");
	  loadSummary();
	  loadCashFlow();
	};
	
	const submitCommissionPayment = async (row, form) => {
	  const json = buildPaymentPayload(
		{
		  amount: row.commissionPayable,
		  paidTo: row.agentId,
		  saleId: row.saleId,
		  plotId: row.plotId,
		  ...form
		},
		"COMMISSION"
	  );
	  await API.post("/api/payments", json);
	};
	
	const buildPaymentPayload = (data, type) => {
		const paymentDateTime = `${data.paymentDate}T00:00:00`;
	  if (type === "RECEIVABLE") {
		return {
		  paymentType: "RECEIVED",
		  plotId: data.plotId,
		  amount: data.amount,
		  paymentDate:paymentDateTime,
		  paymentMode: data.paymentMode,
		  transactionRef: data.transactionRef,
		  remarks: data.remarks
		};
	  }

	  if (type === "COMMISSION") {
		return {
		  paymentType: "PAID",
		  saleId: data.saleId,
		  paidTo: data.paidTo,
		  amount: data.amount,
		  paymentDate: paymentDateTime,
		  paymentMode: data.paymentMode,
		  transactionRef: data.transactionRef,
		  remarks: data.remarks
		};
	  }

	  throw new Error("Invalid payment type");
	};
	
	const handlePaymentSubmit = async (payload) => {
		//console.log("handlePaymentSubmit payload: "+payload);
	  try {
		  const jsonData = {
			  paymentType: "PAID",
			  saleId: drawer.row.saleId,
			  amount: Number(drawer.row.commissionPayable), // already rounded
			  
			  paidTo: drawer.row.agentId,                    // ✅ CRITICAL
			  paymentMode: payload.paymentMode,
			  transactionRef: payload.transactionRef,
			  remarks: payload.remarks
			};
		  
		  console.log("handlePaymentSubmit paidTo: "+jsonData);
		await API.post("/api/payments", jsonData);
		showToast("Payment saved successfully");
		setShowPaymentModal(false);	
		loadSummary();
		loadCashFlow();
		// optionally refresh payments list
	  } catch (err) {
		showToast("Failed to save payment");
	  }
	};

	return (
		<div className="p-2">
			<h4 className="text-xl font-semibold mb-4">Finance Operations</h4>

			<FinanceSummaryCards data={summary} onFilter={handleFilter} />

			
			{/* SALE VIEW */}
			{viewType === "SALE"  && tableData?.[0]?.saleId && (
			  <>
				<SectionHeader
				  title="Sale Details"
				  onBack={() => setViewType("CASHFLOW")}
				/>
				<SaleDetailsTable
				  data={tableData}
				  loading={loading}
				/>
			  </>
			)}
			
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
						onAction={handleTableAction}
						
					/>
				</>
			)}
			
			{/* RECEIVED VIEW */}
			{viewType === "RECEIVED" && (
			  <>
				<SectionHeader
				  title="Received Details"
				  onBack={() => setViewType("CASHFLOW")}
				/>
				<FinanceDetailsTable
				  type="RECEIVED"
				  data={tableData}
				  onAmountClick={handleAmountClick}
				/>
			  </>
			)}

			{/* PAID VIEW */}
			{viewType === "PAID" && (
			  <>
				<SectionHeader
				  title="Commission Paid Details"
				  onBack={() => setViewType("CASHFLOW")}
				/>
				<FinanceDetailsTable
				  type="PAID"
				  data={tableData}
				  onAmountClick={handleAmountClick}
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
						onAction={handleTableAction}
					/>
				</>
			)}

			{/* DEFAULT CASH FLOW VIEW */}
			{viewType === "CASHFLOW" && (
				<>
					<FinanceFilters
						onApply={(f) => {
							setFilters(f);
							loadCashFlow(f);
						}}
					/>

					<CashFlowTable rows={rows} onAction={handleCashflowAction} />
				</>
			)}
			
			<Modal
			  size="xl"
			>
			  <Modal.Header closeButton>
				<Modal.Title>
				  {viewType === "RECEIVED" && "Received Details"}
				  {viewType === "PAID" && "Commission Paid Details"}
				</Modal.Title>
			  </Modal.Header>

			  <Modal.Body>
				<FinanceDetailsTable
				  type={viewType}
				  data={tableData}
				/>
			  </Modal.Body>
			</Modal>



			<PaymentDrawer
				open={drawer.open}
				row={drawer.row}
				action={drawer.action}
				onClose={() => setDrawer(d => ({ ...d, open: false }))}
				onSuccess={() => {
					loadSummary();
					loadCashFlow();
					setDrawer({ open: false });
				}}
			/>
			
			<PaymentModal
			  open={showPaymentModal}
			  plotId={selectedPlotId}
			  outstandingAmount={selectedOutstanding}
			  onClose={() => setShowPaymentModal(false)}
			  onSubmit={submitReceivablePayment}
			  
			/>
			<CommentsOverlay
			  show={showCommentsOverlay}
			  customerId={selectedCustomerId}
			  onClose={() => setShowCommentsOverlay(false)}
			/>
			
			<TransactionHistoryModal
			  show={showTxnModal}
			  onHide={() => setShowTxnModal(false)}
			  saleId={saleId}
			  txnType={txnType}
			  agentId={agentId}
			/>

		</div>
	);
};

export default FinanceDashboard;
