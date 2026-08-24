"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

export function GoogleCalendarCard() {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/calendar/status");
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
      }
    } catch (err) {
      console.error("Failed to fetch Google Calendar status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const res = await fetch("/api/calendar/connect");
      const data = await res.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert("Failed to initialize Google Calendar auth");
        setConnecting(false);
      }
    } catch (err) {
      console.error("Connect error:", err);
      alert("Error connecting to Google Calendar");
      setConnecting(false);
    }
  };

  return (
    <Card className="border-sky-100 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            <CardTitle className="text-lg font-semibold">Google Calendar Integration</CardTitle>
          </div>
          {loading ? (
            <Badge variant="outline" className="animate-pulse">Loading...</Badge>
          ) : isConnected ? (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" /> Not Connected
            </Badge>
          )}
        </div>
        <CardDescription>
          Automatically sync scheduled patient appointments directly to your Google Calendar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground bg-sky-50/60 p-3 rounded-lg border border-sky-100 space-y-1">
          <p className="font-medium text-sky-900">💡 How Calendar Sync Works:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-sky-800">
            <li>Direct OAuth sync places booked appointments directly into your Google Calendar.</li>
            <li>Booking confirmation emails also contain interactive <code>.ics</code> calendar invitations.</li>
          </ul>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={handleConnect}
            disabled={connecting}
            className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2"
          >
            {connecting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" /> Connecting...
              </>
            ) : isConnected ? (
              <>
                <RefreshCw className="h-4 w-4" /> Reconnect Google Account
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" /> Connect Google Calendar
              </>
            )}
          </Button>

          <Button variant="outline" onClick={fetchStatus} size="icon" title="Refresh status">
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
