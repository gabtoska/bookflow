"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Settings,
  LogOut,
  Menu,
  Calendar as CalendarIcon,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appuntamenti", href: "/appointments", icon: Calendar },
  { name: "Clienti", href: "/clients", icon: Users },
  { name: "Servizi", href: "/services", icon: Scissors },
  { name: "Impostazioni", href: "/settings", icon: Settings },
];

interface MobileNavProps {
  businessName: string;
}

export function MobileNav({ businessName }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-52 p-3">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-10 items-end gap-2 border-b pb-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <SheetTitle className="font-bold text-sm">BookFlow</SheetTitle>
          </div>

          {/* Business name */}
          <div className="border-b py-2 mt-2">
            <p className="truncate text-xs font-medium">{businessName}</p>
            <p className="text-xs text-muted-foreground">Business</p>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 py-3">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sign out */}
          <div className="border-t pt-2">
            <Button
              variant="ghost"
              size="xs"
              className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Esci</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
