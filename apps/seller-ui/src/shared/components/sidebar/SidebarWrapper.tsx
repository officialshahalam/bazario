"use client";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import useSidebar from "apps/seller-ui/src/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box/Box";
import { Sidebar } from "./Sidebar.styles";
import Link from "next/link";
import Logo from "apps/seller-ui/src/assets/svgs/Logo";
import SideBarItem from "./Sidebar.item";
import Home from "apps/seller-ui/src/assets/icons/Home";
import SidebarMenu from "./Sidebar.menu";
import {
  BellPlus,
  BellRing,
  CalendarPlus,
  ListOrdered,
  LogOut,
  Mail,
  PackageSearch,
  Settings,
  SquarePlus,
  TicketPercent,
} from "lucide-react";
import PaymentIcon from "apps/seller-ui/src/assets/icons/Payments";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathname = usePathname();
  const { seller } = useSeller();

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  useEffect(() => {
    setActiveSidebar(pathname);
  }, [pathname, setActiveSidebar]);
  return (
    <Box
      css={{
        height: "100vh",
        zIndex: "202",
        position: "sticky",
        top: "0",
        padding: "8px",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-lg font-medium text-[#ecedee] capitalize">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] ">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div>
        <Sidebar.Body>
          <SideBarItem
            title="Dashboard"
            href="/dashboard"
            isActive={activeSidebar === "/dashboard"}
            icon={<Home fill={getIconColor("/dashboard")} />}
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main menu">
              <SideBarItem
                title="Orders"
                href="/dashboard/orders"
                isActive={activeSidebar === "/dashboard/orders"}
                icon={<ListOrdered fill={getIconColor("/dashboard/orders")} />}
              />
              <SideBarItem
                title="Payments"
                href="/dashboard/payments"
                isActive={activeSidebar === "/dashboard/payments"}
                icon={
                  <PaymentIcon fill={getIconColor("/dashboard/payments")} />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SideBarItem
                title="Create Product"
                href="/dashboard/create-product"
                isActive={activeSidebar === "/dashboard/create-product"}
                icon={
                  <SquarePlus
                    size={24}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
              />
              <SideBarItem
                title="All Products"
                href="/dashboard/all-products"
                isActive={activeSidebar === "/dashboard/all-products"}
                icon={
                  <PackageSearch
                    size={24}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Events">
              <SideBarItem
                title="Create Event"
                href="/dashboard/create-event"
                isActive={activeSidebar === "/dashboard/create-event"}
                icon={
                  <CalendarPlus
                    size={24}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
              />
              <SideBarItem
                title="All Events"
                href="/dashboard/all-events"
                isActive={activeSidebar === "/dashboard/all-events"}
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SideBarItem
                title="Inbox"
                href="/dashboard/inbox"
                isActive={activeSidebar === "/dashboard/inbox"}
                icon={
                  <Mail
                    size={24}
                    color={getIconColor("/dashboard/inbox")}
                  />
                }
              />
              <SideBarItem
                title="Settings"
                href="/dashboard/settings"
                isActive={activeSidebar === "/dashboard/settings"}
                icon={
                  <Settings
                    size={24}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
              />
              <SideBarItem
                title="Notifications"
                href="/dashboard/notifications"
                isActive={activeSidebar === "/dashboard/notifications"}
                icon={
                  <BellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SideBarItem
                title="Discount Code"
                href="/dashboard/discount-code"
                isActive={activeSidebar === "/dashboard/discount-code"}
                icon={
                  <TicketPercent
                    size={24}
                    color={getIconColor("/dashboard/discount-code")}
                  />
                }
              />
              <SideBarItem
                title="Logout"
                href="/logout"
                isActive={activeSidebar === "/logout"}
                icon={
                  <LogOut
                    size={24}
                    color={getIconColor("/logout")}
                  />
                }
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
