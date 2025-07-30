import BreadCrumbs from "apps/admin-ui/src/shared/components/breadCrumbs/BreadCrumbs";
import React from "react";

const Page = () => {
  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      {/* Header */}
      <h2 className="text-2xl text-white font-semibold mb--2 tracking-wide">
        Notifications
      </h2>
      <BreadCrumbs title="Notifications" />
      <p className="text-center pt-24 text-white text-sm font-Poppins">
        No Notifications available yet!
      </p>
    </div>
  );
};

export default Page;
