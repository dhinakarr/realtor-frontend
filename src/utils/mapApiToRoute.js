export function mapApiToRoute(apiUrl) {
  if (!apiUrl) return "/";

  let url = apiUrl.startsWith("/") ? apiUrl : "/" + apiUrl;
//console.log("mapApiToRoute url: "+url);
  if (url.includes("/api/permissions")) {
	  //console.log("mapApiToRoute inside permissions url: "+url);
	  return "/admin/permissions";
  }
  if (url.includes("/api/users")) return "/admin/users";
  if (url.includes("/api/roles")) return "/admin/roles";
  if (url.includes("/api/modules")) return "/admin/modules";
  if (url.includes("/api/features")) return "/admin/features";
  

  return "/";
}
