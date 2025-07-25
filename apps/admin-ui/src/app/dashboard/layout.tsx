import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex bg-black h-screen">
      <aside
        className="w-[280px] min-w-[250px] max-w-[300px] border-r border-r-slate-800 text-white p-4 overflow-scroll"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="sticky top-0">
          SideBar
        </div>
      </aside>
      <main className="flex-1">
        <div
          className="h-screen overflow-scroll"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
