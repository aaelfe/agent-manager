import { Form, Link } from "@remix-run/react";
import { Button } from "../components/ui/button";
import type { User } from '@supabase/supabase-js';

export function AuthStatus({ user }: { user: User | null }) {
  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <span>Signed in as {user.email}</span>
          <Form action="/logout" method="post">
            <Button type="submit" variant="outline" size="sm">
              Sign Out
            </Button>
          </Form>
        </>
      ) : (
        <Link to="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      )}
    </div>
  );
}