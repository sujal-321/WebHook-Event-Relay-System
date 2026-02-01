import { useState } from "react";
import Navbar from "@/components/Navbar";
import Dashboard from "@/pages/Dashboard";
import Webhooks from "@/pages/Webhooks";
import Logs from "@/pages/Logs";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <>
      <Navbar current={page} onChange={setPage} />
      {page === "dashboard" && <Dashboard />}
      {page === "webhooks" && <Webhooks />}
      {page === "logs" && <Logs />}
    </>
  );
}
