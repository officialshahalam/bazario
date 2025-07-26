"use client";
import React from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 mt-6 flex items-center justify-center bg-slate-800 rounded-lg">
      <span className="text-slate-400">Loading chart...</span>
    </div>
  ),
});

interface SalesChartProps {
  ordersData?: {
    month: string;
    count: number;
  }[];
}

export const SalesChart = ({ ordersData }: SalesChartProps) => {
  // Default data if no ordersData is provided
  const defaultData = [
    { month: "Jan", count: 31 },
    { month: "Feb", count: 40 },
    { month: "Mar", count: 28 },
    { month: "Apr", count: 51 },
    { month: "May", count: 42 },
    { month: "Jun", count: 109 },
    { month: "Jul", count: 100 },
    { month: "agu", count: 130 },
    { month: "sep", count: 110 },
    { month: "oct", count: 60 },
    { month: "nov", count: 10 },
    { month: "dec", count: 80 },
  ];

  const data = ordersData || defaultData;

  const chartSeries = [
    {
      name: "Sales",
      data: data.map((item) => item.count),
    },
  ];

  const chartOptions = {
    chart: {
      type: "area" as const,
      height: 850,
      background: "transparent",
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: false,
      },
    },
    theme: {
      mode: "dark" as const,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
      colors: ["#3b82f6"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: "#3b82f6",
            opacity: 0.8,
          },
          {
            offset: 100,
            color: "#1e40af",
            opacity: 0.1,
          },
        ],
      },
    },
    grid: {
      show: true,
      borderColor: "#374151",
      strokeDashArray: 0,
      position: "back" as const,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: false,
        },
      },
      row: {
        colors: undefined,
        opacity: 0.1,
      },
      column: {
        colors: undefined,
        opacity: 0.1,
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    xaxis: {
      categories: data.map((item) => item.month),
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: "#9ca3af",
          fontSize: "12px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 400,
        },
      },
    },
    yaxis: {
      show: true,
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
      },
      x: {
        show: true,
      },
      y: {
        formatter: function (val: number) {
          return val.toString();
        },
      },
      marker: {
        show: true,
      },
      custom: function ({ series, seriesIndex, dataPointIndex, w }: any) {
        const value = series[seriesIndex][dataPointIndex];
        const month = w.globals.labels[dataPointIndex];

        return `
          <div style="background: #1e293b; border: none; border-radius: 8px; padding: 8px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="color: #3b82f6; font-weight: 500; margin-bottom: 2px;">${month}</div>
            <div style="color: #ffffff; font-size: 14px; font-weight: 600;">${value}</div>
          </div>
        `;
      },
    },
    markers: {
      size: 0,
      colors: ["#3b82f6"],
      strokeColors: "#ffffff",
      strokeWidth: 2,
      hover: {
        size: 6,
        sizeOffset: 2,
      },
    },
    legend: {
      show: false,
    },
    colors: ["#3b82f6"],
  };

  return (
    <div className="w-full h-64 mt-6">
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height="100%"
        width="100%"
      />
    </div>
  );
};

export default SalesChart;
