import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const BreadCrumbs = ({ title }: { title: string }) => {
  return (
      
      <div className="flex items-center">
        <Link href={"/dashboard"} className="text-[#80deea] cursor-pointer">
          Dashboard
        </Link>
        <ChevronRight size={20} className="opacity-[.8] text-white" />
        <span className="text-white">{title}</span>
      </div>
  );
};

export default BreadCrumbs;
