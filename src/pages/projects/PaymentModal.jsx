import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

export default function PaymentModal({ open, onClose, saleId, onSubmit }) {
  const [form, setForm] = useState({
    paymentType: "RECEIVED",
    amount: "",
    paymentMode: "CASH",
    transactionRef: "",
    remarks: "",
    paidTo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit({
      ...form,
      saleId,
      amount: Number(form.amount),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md h-full bg-white shadow-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Card className="h-full rounded-none">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Add Payment</h2>
                  <button onClick={onClose}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form */}
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <div>
                    <label className="text-sm font-medium">Payment Type</label>
                    <select
                      name="paymentType"
                      value={form.paymentType}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="RECEIVED">Received</option>
                      <option value="PAID">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Payment Mode</label>
                    <select
                      name="paymentMode"
                      value={form.paymentMode}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    >
                      <option value="CASH">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CHEQUE">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Transaction Ref</label>
                    <input
                      type="text"
                      name="transactionRef"
                      value={form.transactionRef}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>

                  {form.paymentType === "PAID" && (
                    <div>
                      <label className="text-sm font-medium">Paid To (User ID)</label>
                      <input
                        type="text"
                        name="paidTo"
                        value={form.paidTo}
                        onChange={handleChange}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Remarks</label>
                    <textarea
                      name="remarks"
                      value={form.remarks}
                      onChange={handleChange}
                      className="w-full border rounded-lg p-2"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button className="flex-1" onClick={handleSubmit}>
                    Save Payment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
