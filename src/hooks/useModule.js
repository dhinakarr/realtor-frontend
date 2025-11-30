export default function useModule(featureUrl = "") {
  // Always parse safely
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const permissions = user?.permission || [];

  // Ensure permissions is always an array
  if (!Array.isArray(permissions)) return null;

  // Find matching module
  for (const module of permissions) {
    const matched = module.features?.some(f =>
      featureUrl.includes(f.url) || f.url.includes(featureUrl)
    );

    if (matched) return module;
  }

  return null;
}
