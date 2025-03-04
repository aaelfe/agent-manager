// app/routes/login.tsx
import { Form } from "@remix-run/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Button } from "../components/ui/button";
import { createSupabaseServerClient } from "../lib/supabase.server";
import { Provider } from '@supabase/supabase-js';
import React from "react";

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const { supabase } = createSupabaseServerClient(request, response);

  // Get form data
  const formData = await request.formData();
  const formType = formData.get("formType") as string;

  if (formType === "oauth") {
    const provider = formData.get("provider") as string;

    // Create auth URL for the selected provider
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/callback`,
      },
    });

    if (error) {
      return json({ error: error.message }, { status: 400 });
    }

    return redirect(data.url, {
      headers: response.headers,
    });
  } else if (formType === "email") {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const isSignUp = formData.get("isSignUp") === "true";

    if (isSignUp) {
      // Sign up with email and password
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        },
      });

      if (error) {
        return json({ error: error.message }, { status: 400 });
      }

      return json({ 
        success: true, 
        message: "Check your email for the confirmation link" 
      });
    } else {
      // Sign in with email and password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        return json({ error: error.message }, { status: 400 });
      }

      console.log("User authenticated:", data.user?.email);
      console.log("Session established:", !!data.session);

      // Add a debug check for the session
      if (data.session) {
        console.log("Session token exists:", !!data.session.access_token);
        
        // Verify the session was created
        const sessionCheck = await supabase.auth.getSession();
        console.log("Session check after login:", !!sessionCheck.data.session);
      }

      return redirect("/protected", {
        headers: response.headers,
      });
    }
  }

  return json({ error: "Invalid form submission" }, { status: 400 });
}

export default function Login() {
  const [isSignUp, setIsSignUp] = React.useState(false);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-2">Welcome</h1>
      <p className="text-gray-600 mb-6">Sign in or create a new account</p>
      
      <div className="w-full max-w-md space-y-6">
        {/* Email Form */}
        <Form method="post" className="space-y-4">
          <input type="hidden" name="formType" value="email" />
          <input type="hidden" name="isSignUp" value={isSignUp.toString()} />
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md"
              placeholder="••••••••"
            />
          </div>
          
          <Button type="submit" className="w-full">
            {isSignUp ? "Create Account" : "Sign In"}
          </Button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </Form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        {/* OAuth Providers */}
        <div className="grid grid-cols-2 gap-3">
          <Form method="post">
            <input type="hidden" name="formType" value="oauth" />
            <input type="hidden" name="provider" value="github" />
            <Button type="submit" className="w-full flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
              GitHub
            </Button>
          </Form>
          
          <Form method="post">
            <input type="hidden" name="formType" value="oauth" />
            <input type="hidden" name="provider" value="google" />
            <Button type="submit" className="w-full flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </Form>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  );
}