import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, headers } = await requireAuth(request);
  
  return json(
    { user },
    { headers }
  );
}

export default function Protected() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Protected Page</h1>
      <p>You are logged in as: {user.email}</p>
      <pre className="bg-gray-100 p-4 mt-4 rounded">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
} 