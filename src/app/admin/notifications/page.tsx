"use client";

import { useEffect, useState } from "react";
import { NotificationLogTable } from "@/components/admin/notification-log-table";

export default function AdminNotificationsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Notifications would be fetched from a dedicated API
    // For now, this is a placeholder
    setIsLoading(false);
  }, []);

  const handleRetry = async (id: string) => {
    // Would call a retry endpoint
    alert("Retry triggered for notification " + id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notification Logs</h1>
        <p className="text-muted-foreground mt-1">
          Monitor email delivery status and retry failed notifications
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
        </div>
      ) : (
        <NotificationLogTable
          logs={logs}
          onRetry={handleRetry}
          isLoading={false}
        />
      )}
    </div>
  );
}
