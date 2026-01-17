import React, { useEffect, useState } from "react";
import { Modal, Table, Spinner } from "react-bootstrap";

import API from "../../api/api";

const TransactionHistoryModal = ({ show, onHide, saleId, txnType, agentId }) => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  

  useEffect(() => {
	  if (!show || !saleId) return;

	  setLoading(true);

	  API.get(`/api/payments/sale/${saleId}/list`)
		.then(res => {
		  const list = Array.isArray(res.data?.data) ? res.data.data : [];

		  const filtered = list.filter(t => {
			if (txnType === "PAID") {
			  return (
				t.paymentType === "PAID" &&
				t.paidTo === agentId   // 🔥 key line
			  );
			}

			if (txnType === "RECEIVED") {
			  return t.paymentType === "RECEIVED";
			}

			return true;
		  });

		  setTransactions(filtered);
		})
		.catch(err => {
		  console.error("Failed to load transactions", err);
		  setTransactions([]);
		})
		.finally(() => setLoading(false));
	}, [show, saleId, txnType, agentId]);


  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Transaction History {txnType && `(${txnType})`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner />
          </div>
        ) : (
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Mode</th>
				<th>Reference</th>
                <th className="text-end">Amount</th>
                
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted">
                    No transactions found
                  </td>
                </tr>
              ) : (
                transactions.map(txn => (
                  <tr key={txn.id}>
                    <td>{new Date(txn.paymentDate).toLocaleDateString()}</td>
                    <td>{txn.paymentType}</td>
                    <td>{txn.paymentMode}</td>
					<td>{txn.remarks || "-"}</td>
                    <td className="text-end">₹{txn.amount}</td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default TransactionHistoryModal;
