import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold">System Status</h2>
          <p className="text-muted-foreground">
            Webhook relay system is running.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
