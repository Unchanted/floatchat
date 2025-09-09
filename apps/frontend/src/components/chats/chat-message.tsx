"use client";

import React, { useState } from "react";
import { Card } from "../../../../../packages/ui/src/components/card";
import {
  Avatar,
  AvatarFallback,
} from "../../../../../packages/ui/src/components/avatar";
import { Button } from "../../../../../packages/ui/src/components/button";
import { 
  ExternalLink, 
  Bot, 
  User, 
  Copy, 
  Check,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type { Message } from "./chat-interface";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "../../../../../packages/ui/src/components/table";

export function ChatMessage({ 
  message, 
  activeTab, 
  setActiveTab 
}: { 
  message: Message;
  activeTab: 'answer' | 'sources' | 'graph' | 'steps';
  setActiveTab: (tab: 'answer' | 'sources' | 'graph' | 'steps') => void;
}) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const isUser = message.role === "user";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const explainVariable = (key: string): string => {
    const k = key.toLowerCase();
    if (/(temp|temperature)/.test(k)) return "In-situ temperature (°C) measured by Argo float sensors.";
    if (/(psal|sal|salinity)/.test(k)) return "Practical salinity (PSU) representing salt content.";
    if (/(pres|pressure)/.test(k)) return "Pressure (decibars) corresponding to measurement depth.";
    if (/(lat|latitude)/.test(k)) return "Latitude of the observation (degrees).";
    if (/(lon|longitude)/.test(k)) return "Longitude of the observation (degrees).";
    if (/time|date/.test(k)) return "Timestamp of the observation (UTC).";
    if (/cycle|prof|profile/.test(k)) return "Profile or cycle identifier for the float measurement sequence.";
    if (/platform|wmo|id/.test(k)) return "Unique platform/float identifier (WMO ID).";
    if (/qc/.test(k)) return "Quality control flag indicating data quality status.";
    if (/depth/.test(k)) return "Depth estimate derived from pressure (meters).";
    return "Data column from the returned dataset.";
  };

  const formatLat = (lat: number) => `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
  const formatLon = (lon: number) => `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
  const buildFriendlyQuerySummary = (meta: any): string[] => {
    const lines: string[] = [];
    if (meta?.date_start && meta?.date_end) {
      lines.push(`Time window: ${meta.date_start} → ${meta.date_end}`);
    }
    if (meta?.box) {
      const b = meta.box;
      const latMin = Number(b.lat_min);
      const latMax = Number(b.lat_max);
      const lonMin = Number(b.lon_min);
      const lonMax = Number(b.lon_max);
      if ([latMin, latMax, lonMin, lonMax].every((v) => !Number.isNaN(v))) {
        const areaText = `Area: ${formatLat(latMin)} – ${formatLat(latMax)}, ${formatLon(lonMin)} – ${formatLon(lonMax)}`;
        if (meta.expanded_search) {
          lines.push(`${areaText} (expanded search)`);
        } else {
          lines.push(areaText);
        }
      }
    } else if (Array.isArray(meta?.points) && meta.points.length > 0) {
      const pts = meta.points as Array<{ lat: number; lon: number }>;
      const preview = pts.slice(0, 5)
        .map((p) => `${formatLat(Number(p.lat))}, ${formatLon(Number(p.lon))}`)
        .join("; ");
      const suffix = pts.length > 5 ? ` … (+${pts.length - 5} more)` : "";
      lines.push(`Locations: ${preview}${suffix}`);
    }
    return lines;
  };

  // Perplexity-style: render user query as a full-width header with action chips
  if (isUser) {
    return (
      <div className="space-y-3">
        <p className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug whitespace-pre-wrap">
          {message.content}
        </p>
        <div className="flex items-center gap-2">
          <Button 
            aria-label="Answer" 
            size="sm" 
            variant={activeTab === 'answer' ? 'secondary' : 'ghost'} 
            className="h-7 px-2 rounded-md"
            onClick={() => setActiveTab('answer')}
          >
            Answer
          </Button>
          <Button 
            aria-label="Sources" 
            size="sm" 
            variant={activeTab === 'sources' ? 'secondary' : 'ghost'} 
            className="h-7 px-2 rounded-md"
            onClick={() => setActiveTab('sources')}
          >
            Sources
          </Button>
          <Button 
            aria-label="Graph" 
            size="sm" 
            variant={activeTab === 'graph' ? 'secondary' : 'ghost'} 
            className="h-7 px-2 rounded-md"
            onClick={() => setActiveTab('graph')}
          >
            Graph
          </Button>
          <Button 
            aria-label="Steps" 
            size="sm" 
            variant={activeTab === 'steps' ? 'secondary' : 'ghost'} 
            className="h-7 px-2 rounded-md"
            onClick={() => setActiveTab('steps')}
          >
            Steps
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short'
          })}
        </p>
      </div>
    );
  }

  // Assistant message: Perplexity-style full-width block with tabbed content
  return (
    <div
      className="group relative space-y-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        variant="ghost"
        size="sm"
        className={`absolute -top-2 -right-2 h-8 w-8 p-0 transition-opacity ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        onClick={copyToClipboard}
        title="Copy message"
        aria-label="Copy assistant message"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>

      {/* Tab Content */}
      {activeTab === 'answer' && (
        <div className="space-y-3">
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                ul: ({ node, ...props }) => (
                  <ul className="list-disc pl-6 my-2 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal pl-6 my-2 space-y-1" {...props} />
                ),
                li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                em: ({ node, ...props }) => <em className="italic" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic my-3" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a {...props} target="_blank" rel="noreferrer" />
                ),
           p: ({ children, ...props }: any) => {
             // Check if this paragraph contains a code block (pre element)
             const hasCodeBlock = React.Children.toArray(children).some((child: any) => 
               child && typeof child === 'object' && child.type === 'pre'
             );
             
             if (hasCodeBlock) {
               // If it contains a code block, don't wrap it in p
               return <>{children}</>;
             }
             return <p className="leading-relaxed" {...props}>{children}</p>;
           },
           pre: ({ children, ...props }: any) => {
             // Custom pre component to ensure proper structure
             return (
               <pre className="rounded-md bg-muted p-3 overflow-x-auto text-sm my-4" {...props}>
                 {children}
               </pre>
             );
           },
           code: ({ inline, className, children, ...props }: any) => {
             if (inline) {
               return (
                 <code className={`${className} bg-muted px-1.5 py-0.5 rounded text-sm`} {...props}>
                   {children}
                 </code>
               );
             }
             // For block code, just return the code element (pre will be handled by pre component)
             return (
               <code className="text-sm" {...props}>
                 {children}
               </code>
             );
           },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Query meta */}
          {message.queryMeta && (
            <div className="text-sm border rounded-lg p-4 bg-muted/20">
              <div className="font-semibold text-foreground mb-3">What I looked for</div>
              <ul className="space-y-2">
                {buildFriendlyQuerySummary(message.queryMeta).map((line, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                    <span className="text-muted-foreground">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Variable explanations */}
          {Array.isArray(message.tableData) && message.tableData.length > 0 && (
            <div className="text-sm border rounded-lg p-4 bg-muted/20">
              <div className="font-semibold text-foreground mb-3">Variable Guide</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(message.tableData[0]).slice(0, 12).map((key) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-mono font-medium text-foreground min-w-0 flex-shrink-0">
                      {key}
                    </span>
                    <span className="text-muted-foreground text-xs leading-relaxed">
                      {explainVariable(key)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(message.tableData) && message.tableData.length > 0 && (
            <div className="mt-4">
              {(() => {
                // Enable toggle if we detect full_summary in message content structure
                const hasFull = !!(message as any)?.queryMeta; // meta always present
                return (
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-foreground">Data Results</div>
                    {hasFull && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 rounded-md text-xs"
                        onClick={() => setShowFull((v) => !v)}
                      >
                        {showFull ? "Show filtered columns" : "Show all columns"}
                      </Button>
                    )}
                  </div>
                );
              })()}
              {(() => {
                // If showFull is true and backend provided full_summary, use it
                const full: Array<Record<string, any>> | undefined = (message as any).fullTableData;
                const dataset = showFull && Array.isArray(full) && full.length > 0 ? full : message.tableData;
                const rows = dataset.slice(0, 50);
                const columns = Object.keys(rows[0] || {});
                return (
                  <div className="border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        {columns.map((col) => (
                          <TableHead key={col} className="font-semibold text-foreground">{col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, idx) => (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          {columns.map((col) => {
                            const value = (row as Record<string, unknown>)[col];
                            const display =
                              value === null || value === undefined
                                ? ""
                                : typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value);
                            return (
                              <TableCell key={col} className="text-sm">
                                {display}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableCaption>
                      Showing {rows.length} row{rows.length === 1 ? "" : "s"}
                      {dataset.length > rows.length
                        ? ` of ${dataset.length}`
                        : ""}
                    </TableCaption>
                      </Table>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sources' && (
        <div className="space-y-3">
          {Array.isArray(message.sources) && message.sources.length > 0 ? (
            <div className="space-y-2">
              {message.sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-2"
                    >
                      {source.title}
                    </a>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new URL(source.url).hostname}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ExternalLink className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No sources available for this response.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'graph' && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Graph visualization coming soon.</p>
        </div>
      )}

      {activeTab === 'steps' && (
        <div className="space-y-3">
          {(() => {
            console.log("🔍 Steps tab - message.thinkingSteps:", message.thinkingSteps);
            console.log("🔍 Steps tab - message.thinkingSteps length:", message.thinkingSteps?.length);
            return null;
          })()}
          {message.thinkingSteps && message.thinkingSteps.length > 0 ? (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground mb-3">Analysis Steps</div>
              <div className="space-y-2">
                {message.thinkingSteps.map((step, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-muted/20"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No thinking steps available for this response.</p>
              <p className="text-xs mt-2">Debug: thinkingSteps = {JSON.stringify(message.thinkingSteps)}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {new Date(message.timestamp).toLocaleString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          day: 'numeric',
          month: 'short'
        })}
      </p>
    </div>
  );
}