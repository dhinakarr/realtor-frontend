import API from "./api";

export const getFinanceSummary = (params) =>
	API.get("/api/finance/summary", { params });

export const getCashFlow = (params) =>
	API.get("/api/finance/cashflow", { params });
