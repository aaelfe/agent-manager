import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "../components/ui/button";
import { createSupabaseServerClient } from "../lib/supabase.server";

export async function action({ request }: ActionFunctionArgs) {
  const response = new Response();
  const { supabase, headers } = createSupabaseServerClient(request, response);
  
  await supabase.auth.signOut();
  
  return redirect("/login", {
    headers,
  });
}

export async function loader() {
  return redirect("/login");
}

export default function Logout() {
  return (
    <div className="p-4">
      <Form method="post">
        <Button type="submit">Sign Out</Button>
      </Form>
    </div>
  );
}