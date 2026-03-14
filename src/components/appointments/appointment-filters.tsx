"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tutti gli stati" },
  { value: "PENDING", label: "In attesa" },
  { value: "CONFIRMED", label: "Confermato" },
  { value: "CANCELLED", label: "Annullato" },
  { value: "COMPLETED", label: "Completato" },
  { value: "NO_SHOW", label: "No-show" },
];

export function AppointmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "ALL");

  function updateParams(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value && value !== "ALL") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    }
    router.replace(`?${params.toString()}`);
  }

  // Debounce search query
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateParams({ q: query });
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative max-w-xs flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cerca cliente..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          updateParams({ date: e.target.value });
        }}
        className="w-auto"
      />

      <Select
        value={status}
        onValueChange={(val) => {
          setStatus(val ?? "ALL");
          updateParams({ status: val ?? "ALL" });
        }}
      >
        <SelectTrigger className="w-auto min-w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
