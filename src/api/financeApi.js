import API from "./api";

export const getFinanceSummary = () =>
	API.get("/api/finance/summary");

export const getCashFlow = (params) =>
	API.get("/api/finance/cashflow", { params });
