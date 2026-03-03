"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
  className?: string;
}

export function Tabs({
  tabs,
  defaultTab,
  onTabChange,
  children,
  className,
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab || tabs[0]?.id || ""
  );

  const handleTabChange = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      onTabChange?.(tabId);
    },
    [onTabChange]
  );

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex border-b hairline-dark" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "text-[12px] font-bold uppercase tracking-[0.1em]",
              activeTab === tab.id
                ? "border-b-2 border-black text-black"
                : "text-gray-200 hover:text-black"
            )}
            style={{ padding: "18px 24px" }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto" role="tabpanel">
        {children(activeTab)}
      </div>
    </div>
  );
}
