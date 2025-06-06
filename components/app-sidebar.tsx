// components/app-sidebar.tsx
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Package,
  Truck,
  LogOut,
} from 'lucide-react';
import React from "react";
import {AdminView} from "@/app/types/view";

interface AppSidebarProps {
  onChangeViewAction: (view: AdminView) => void;
  renderedComponentAction: () => React.ReactNode;
}

export function AppSidebar({ onChangeViewAction, renderedComponentAction }: AppSidebarProps) {
  const [open, setOpen] = React.useState(false);

  return (
      <SidebarProvider open={open} onOpenChange={setOpen}>
        <Sidebar collapsible="icon" className="bg-gray-color">
          <SidebarContent>
            <SidebarGroup title="Admin Panel">
              <SidebarGroupLabel className="text-secondary-100">
                RouteMasterPro
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onChangeViewAction("dashboard") }>
                      <LayoutDashboard />
                      <span className="text-white-color font-bold text-h3">Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onChangeViewAction("orders")}>
                      <Package />
                      <span className="text-white-color font-bold text-h3" >Orders</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => onChangeViewAction("couriers")}>
                      <Truck />
                      <span className="text-white-color font-bold text-h3" >Manage Couriers</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={async () => {
                          const { auth } = await import('@/lib/firebaseClient');
                          await auth.signOut();
                          location.href = '/admin/login';
                        }}
                    >
                      <LogOut />
                      <span className="text-error font-bold text-h3" >Logout</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarTrigger />
        <main className="p-4">
          {renderedComponentAction()}
        </main>
      </SidebarProvider>
  );
}

export default AppSidebar;
