"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface NotificationLog {
  _id: string;
  type: string;
  channel: string;
  status: string;
  subject: string;
  retryCount: number;
  maxRetries: number;
  lastAttemptAt: string;
  errorMessage: string;
  createdAt: string;
}

interface NotificationLogTableProps {
  logs: NotificationLog[];
  onRetry?: (id: string) => void;
  isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  sent: { label: "Sent", className: "bg-green-100 text-green-800" },
  delivered: { label: "Delivered", className: "bg-green-100 text-green-800" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800" },
  bounced: { label: "Bounced", className: "bg-orange-100 text-orange-800" },
};

export function NotificationLogTable({
  logs,
  onRetry,
  isLoading = false,
}: NotificationLogTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Channel</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Retries</TableHead>
            <TableHead>Last Attempt</TableHead>
            <TableHead>Error</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No notification logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const status = statusConfig[log.status] || statusConfig.pending;
              return (
                <TableRow key={log._id}>
                  <TableCell className="capitalize">{log.type.replace("-", " ")}</TableCell>
                  <TableCell className="capitalize">{log.channel}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {log.subject}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={status.className}>
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.retryCount}/{log.maxRetries}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.lastAttemptAt
                      ? format(new Date(log.lastAttemptAt), "MMM d, HH:mm")
                      : "-"}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm text-red-600">
                    {log.errorMessage || "-"}
                  </TableCell>
                  <TableCell>
                    {log.status === "failed" && log.retryCount < log.maxRetries && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onRetry?.(log._id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
