import { useState } from "react";
import api from "@/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Webhooks() {
  const [clientName, setClientName] = useState("");
  const [eventType, setEventType] = useState("");
  const [url, setUrl] = useState("");

  const submit = async () => {
    await api.post("/webhooks", {
      client_name: clientName,
      event_type: eventType,
      endpoint_url: url,
    });
    alert("Webhook registered");
  };

  return (
    <div className="p-6 space-y-4 max-w-md">
      <Input placeholder="Client Name" onChange={(e) => setClientName(e.target.value)} />
      <Input placeholder="Event Type" onChange={(e) => setEventType(e.target.value)} />
      <Input placeholder="Webhook URL" onChange={(e) => setUrl(e.target.value)} />
      <Button onClick={submit}>Register Webhook</Button>
    </div>
  );
}
