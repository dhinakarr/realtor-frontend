export const formatINR = (value) => {
  if (value === null || value === undefined) return "₹0";

  const num = Number(value);

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  } else {
    return `₹${num.toLocaleString("en-IN")}`;
  }
};

export const formatINRComma = (value) => {
  if (value === null || value === undefined) return "₹0";
  const rounded = Math.round(Number(value));
  return rounded.toLocaleString("en-IN");
};

export const formatDate = (date) => {
  if (!date) return "-";

  const d = new Date(date);

  if (isNaN(d.getTime())) {
    console.warn("Invalid date:", date); // 👈 debug
    return "-";
  }

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
};