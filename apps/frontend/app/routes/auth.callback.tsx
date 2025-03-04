import { redirect } from '@remix-run/node'
import { createServerClient } from '@supabase/ssr'
import type { LoaderFunctionArgs } from '@remix-run/node'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const response = new Response()
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const supabaseClient = createServerClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      { 
        cookies: {
          getAll: () => {
            const cookieString = request.headers.get('Cookie') || '';
            const cookies: { name: string; value: string }[] = [];
            
            cookieString.split(';').forEach(cookie => {
              const [name, value] = cookie.trim().split('=');
              if (name && value) cookies.push({ name, value });
            });
            
            return cookies;
          },
          setAll: (cookieValues) => {
            Object.entries(cookieValues).forEach(([name, { value }]) => {
              response.headers.append('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
            });
          }
        }
      }
    )
    await supabaseClient.auth.exchangeCodeForSession(code)
  }

  return redirect('/', {
    headers: response.headers,
  })
}