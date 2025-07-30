"use client";
import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import useSidebar from "apps/admin-ui/src/hooks/useSidebar";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box/Box";
import { Sidebar } from "./Sidebar.styles";
import Link from "next/link";
import Logo from "apps/admin-ui/src/assets/svgs/Logo";
import SideBarItem from "./Sidebar.item";
import Home from "apps/admin-ui/src/assets/icons/Home";
import SidebarMenu from "./Sidebar.menu";
import {
  BellPlus,
  BellRing,
  Columns3Cog,
  FileClock,
  ListOrdered,
  LogOut,
  PackageSearch,
  Settings,
  Store,
  Users,
} from "lucide-react";
import PaymentIcon from "apps/admin-ui/src/assets/icons/Payments";

const SidebarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathname = usePathname();
  const { admin } = useAdmin();

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
          <Link
            href={"/"}
            className="flex justify-center items-center text-center gap-2"
          >
            <Logo />
            <Box>
              <h3 className="text-lg font-medium text-[#ecedee] capitalize">
                {admin?.name || "Mohd Hasan"}
              </h3>
              <h5 className="font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] ">
                {admin?.email || "officialshahalam855@gmail.com"}
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
              <SideBarItem
                title="Products"
                href="/dashboard/products"
                isActive={activeSidebar === "/dashboard/products"}
                icon={
                  <PackageSearch
                    size={24}
                    color={getIconColor("/dashboard/products")}
                  />
                }
              />
              <SideBarItem
                title="Events"
                href="/dashboard/events"
                isActive={activeSidebar === "/dashboard/events"}
                icon={
                  <BellPlus
                    size={24}
                    color={getIconColor("/dashboard/events")}
                  />
                }
              />
              <SideBarItem
                title="Users"
                href="/dashboard/users"
                isActive={activeSidebar === "/dashboard/users"}
                icon={
                  <Users
                    size={24}
                    color={getIconColor("/dashboard/users")}
                  />
                }
              />
              <SideBarItem
                title="sellers"
                href="/dashboard/sellers"
                isActive={activeSidebar === "/dashboard/sellers"}
                icon={
                  <Store
                    size={24}
                    color={getIconColor("/dashboard/sellers")}
                  />
                }
              />
            </SidebarMenu>

            <SidebarMenu title="Controllers">
              <SideBarItem
                title="Loggers"
                href="/dashboard/loggers"
                isActive={activeSidebar === "/dashboard/loggers"}
                icon={
                  <FileClock size={24} color={getIconColor("/dashboard/loggers")} />
                }
              />
              <SideBarItem
                title="Management"
                href="/dashboard/management"
                isActive={activeSidebar === "/dashboard/management"}
                icon={
                  <Settings
                    size={24}
                    color={getIconColor("/dashboard/management")}
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
            <SidebarMenu title="Customization">
              <SideBarItem
                title="All Customization"
                href="/dashboard/customization"
                isActive={activeSidebar === "/dashboard/customization"}
                icon={
                  <Columns3Cog
                    size={24}
                    color={getIconColor("/dashboard/customization")}
                  />
                }
              />
              <SideBarItem
                title="Logout"
                href="/logout"
                isActive={activeSidebar === "/logout"}
                icon={<LogOut size={24} color={getIconColor("/logout")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarWrapper;
