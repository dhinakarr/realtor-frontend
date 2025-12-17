export function mapApiToRoute(apiUrl) {
  if (!apiUrl) return "/";

  let url = apiUrl.startsWith("/") ? apiUrl : "/" + apiUrl;
  return url.replace(/^\/api/, "/admin");

/*
  if (url.includes("/api/permissions")) {
	  return "/admin/permissions";
  }
  if (url.includes("/api/users/tree")) return "/admin/users/tree";
  if (url.includes("/api/users")) return "/admin/users";
  if (url.includes("/api/roles")) return "/admin/roles";
  if (url.includes("/api/modules")) return "/admin/modules";
  if (url.includes("/api/features")) return "/admin/features";
  
  

  return "/";
  */
}
