import type { MetaFunction } from "@remix-run/node";
import AgentManager from "../components/agent-manager";
export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <AgentManager />
  );
}
