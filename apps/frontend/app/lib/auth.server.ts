import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "./supabase.server";

/**
 * Requires authentication for a route
 * Redirects to login if user is not authenticated
 */
export async function requireAuth(request: Request) {
  const response = new Response();
  const { supabase, headers } = createSupabaseServerClient(request, response);
  
  // Debug: Log request cookies
  console.log("Auth Request Cookies:", request.headers.get("Cookie"));
  
  const { data, error } = await supabase.auth.getSession();
  
  // Debug: Log session data and any errors
  console.log("Auth Session Data:", JSON.stringify(data, null, 2));
  if (error) console.error("Auth Session Error:", error);
  
  if (!data.session?.user) {
    console.log("No authenticated user found, redirecting to login");
    throw redirect("/login", {
      headers,
    });
  }
  
  // Debug: Log authenticated user
  console.log("Authenticated User:", data.session.user.email);
  
  return {
    user: data.session.user,
    headers,
  };
}

/**
 * Gets the current user if authenticated, otherwise returns null
 */
export async function getCurrentUser(request: Request) {
  const response = new Response();
  const { supabase, headers } = createSupabaseServerClient(request, response);
  
  const { data } = await supabase.auth.getSession();
  
  // Debug: Log session data
  console.log("GetCurrentUser Session:", JSON.stringify(data, null, 2));
  
  return { 
    user: data.session?.user || null,
    headers 
  };
} 