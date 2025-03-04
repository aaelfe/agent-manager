import { createServerClient } from "@supabase/ssr";
import type { Database } from "~/types/supabase";

/**
 * Creates a Supabase server client for server-side operations
 */
export function createSupabaseServerClient(request: Request, response?: Response) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required"
    );
  }

  const responseObject = response || new Response();
  
  // Debug: Log the URL we're creating the client for
  console.log("Creating Supabase client for URL:", request.url);
  
  const cookieHeader = request.headers.get("Cookie") || "";
  console.log("Cookie header:", cookieHeader);
  
  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name) {
          const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            if (key && value) acc[key] = value;
            return acc;
          }, {} as Record<string, string>);
          
          // Check for Supabase session in standard cookie names
          if (name === 'sb-access-token' || name === 'sb-refresh-token') {
            if (cookies[name]) {
              console.log(`Found cookie ${name}`);
              return cookies[name];
            }
            
            // If we have a session stored in the "0" cookie, use that
            if (cookies['0'] && cookies['0'].startsWith('base64-')) {
              try {
                const sessionData = JSON.parse(
                  Buffer.from(cookies['0'].substring(7), 'base64').toString()
                );
                
                if (name === 'sb-access-token' && sessionData.access_token) {
                  console.log("Using access token from session cookie");
                  return sessionData.access_token;
                }
                
                if (name === 'sb-refresh-token' && sessionData.refresh_token) {
                  console.log("Using refresh token from session cookie");
                  return sessionData.refresh_token;
                }
              } catch (e) {
                console.error("Error parsing session cookie:", e);
              }
            }
          }
          
          const match = cookieHeader.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
          const value = match ? decodeURIComponent(match[2]) : undefined;
          if (value) console.log(`Found cookie ${name}=${value.substring(0, 10)}...`);
          return value;
        },
        set(name, value, options) {
          console.log(`Setting cookie: ${name}=${value.substring(0, 10)}...`);
          
          responseObject.headers.append(
            "Set-Cookie",
            `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${options?.maxAge || 3600 * 24 * 7}`
          );
        },
        remove(name) {
          console.log(`Removing cookie: ${name}`);
          
          responseObject.headers.append(
            "Set-Cookie",
            `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
          );
        },
      },
    }
  );

  return { supabase, headers: responseObject.headers };
} 