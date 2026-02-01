import { useEffect, useState } from "react";
import api from "@/api/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/logs").then((res) => setLogs(res.data));
  }, []);

  return (
    <div className="p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Response</TableHead>
            <TableHead>Retries</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>{log.status}</TableCell>
              <TableCell>{log.response_code}</TableCell>
              <TableCell>{log.retry_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
