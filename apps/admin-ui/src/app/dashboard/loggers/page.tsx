"use client";
import BreadCrumbs from "apps/admin-ui/src/shared/components/breadCrumbs/BreadCrumbs";
import { Download } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type LogType = "success" | "error" | "warning" | "info" | "debug";

type LogItem = {
  type?: LogType;
  message: string;
  timestamp: string;
  source?: string;
};

const typeColorMap: Record<LogType, string> = {
  success: "text-green-400",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-300",
  debug: "text-gray-400",
};

const Page = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogItem[]>([]);
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_LOGGER_SOCKET_URI!);

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLogs((prev) => [...prev, parsed]);
      } catch (error) {
        console.error("Invalid log format", error);
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => {
    setFilteredLogs(logs);
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "1") {
        setFilteredLogs(logs.filter((log) => log.type === "error"));
      } else if (e.key === "2") {
        setFilteredLogs(logs.filter((log) => log.type === "success"));
      } else if (e.key === "0") {
        setFilteredLogs(logs);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [logs]);

  const downloadLogs = async () => {
    const content = filteredLogs
      .map(
        (log) =>
          `[${new Date(log.timestamp).toLocaleTimeString()}] ${
            log.source
          } [${log.type?.toUpperCase()}] ${log.message}`
      )
      .join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "application-logs.log";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold tracking-wide">Application Logs</h2>
        <button
          onClick={downloadLogs}
          className="text-xs px-3 py-2 flex justify-center items-center gap-2 bg-gray-600"
        >
          <Download size={18} /> Download Logs
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="mb-4">
        <BreadCrumbs title="Application Logs" />
      </div>

      {/* Log screen  */}
      <div
        ref={logContainerRef}
        className="bg-black font-mono border border-gray-800 rounded-md p-4 h-[600px] overflow-y-auto space-y-2"
      >
        {filteredLogs.length === 0 ? (
          <p>Waiting for logs...</p>
        ) : (
          filteredLogs.map((log, index) => (
            <div key={index} className="whitespace-pre-wrap">
              <span className="text-gray-500">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className="text-purple-400">{log.source}</span>
              <span className={typeColorMap[log.type ?? "info"]}>
                [{log.type?.toUpperCase()}]
              </span>
              <span>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
