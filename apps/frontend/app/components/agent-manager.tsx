import { useState, useEffect, useRef } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"

export default function Home() {
  const [agentId, setAgentId] = useState("")
  const [messages, setMessages] = useState<string[]>([])
  const [wsMessage, setWsMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const connectWebSocket = () => {
    ws.current = new WebSocket("ws://localhost:8000/ws")
    ws.current.onopen = () => setIsConnected(true)
    ws.current.onclose = () => setIsConnected(false)
    ws.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data])
    }
  }

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close()
    }
  }

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(wsMessage)
      setWsMessage("")
    }
  }

  const startAgent = async () => {
    const response = await fetch("/api/start-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId }),
    })
    const data = await response.json()
    setMessages((prev) => [...prev, JSON.stringify(data)])
  }

  const stopAgent = async () => {
    const response = await fetch("/api/stop-agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId }),
    })
    const data = await response.json()
    setMessages((prev) => [...prev, JSON.stringify(data)])
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">FastAPI Test UI</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Agent Control</CardTitle>
            <CardDescription>Start or stop an agent</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="Enter agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button onClick={startAgent}>Start Agent</Button>
              <Button onClick={stopAgent} variant="destructive">
                Stop Agent
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WebSocket</CardTitle>
            <CardDescription>Connect and send messages via WebSocket</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-2">
              <Button onClick={connectWebSocket} disabled={isConnected}>
                Connect
              </Button>
              <Button onClick={disconnectWebSocket} disabled={!isConnected} variant="destructive">
                Disconnect
              </Button>
            </div>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter message"
                value={wsMessage}
                onChange={(e) => setWsMessage(e.target.value)}
                disabled={!isConnected}
              />
              <Button onClick={sendMessage} disabled={!isConnected}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
          <CardDescription>Responses from the server</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {messages.map((message, index) => (
              <li key={index} className="bg-muted p-2 rounded">
                {message}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
