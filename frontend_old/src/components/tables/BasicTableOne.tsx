"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import Badge from "../ui/badge/Badge";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface Order {
  id: number;
  user: {
    image: string;
    nameKey: string;
    roleKey: string;
  };
  projectNameKey: string;
  team: {
    images: string[];
  };
  status: "active" | "pending" | "cancel";
  budget: string;
}

// Define the table data using the interface
const tableData: Order[] = [
  {
    id: 1,
    user: {
      image: "/images/user/user-17.jpg",
      nameKey: "resource.tables.users.lindseyCurtis",
      roleKey: "resource.tables.roles.webDesigner",
    },
    projectNameKey: "resource.tables.projects.agencyWebsite",
    team: {
      images: [
        "/images/user/user-22.jpg",
        "/images/user/user-23.jpg",
        "/images/user/user-24.jpg",
      ],
    },
    budget: "3.9K",
    status: "active",
  },
  {
    id: 2,
    user: {
      image: "/images/user/user-18.jpg",
      nameKey: "resource.tables.users.kaiyaGeorge",
      roleKey: "resource.tables.roles.projectManager",
    },
    projectNameKey: "resource.tables.projects.technology",
    team: {
      images: ["/images/user/user-25.jpg", "/images/user/user-26.jpg"],
    },
    budget: "24.9K",
    status: "pending",
  },
  {
    id: 3,
    user: {
      image: "/images/user/user-17.jpg",
      nameKey: "resource.tables.users.zainGeidt",
      roleKey: "resource.tables.roles.contentWriter",
    },
    projectNameKey: "resource.tables.projects.blogWriting",
    team: {
      images: ["/images/user/user-27.jpg"],
    },
    budget: "12.7K",
    status: "active",
  },
  {
    id: 4,
    user: {
      image: "/images/user/user-20.jpg",
      nameKey: "resource.tables.users.abramSchleifer",
      roleKey: "resource.tables.roles.digitalMarketer",
    },
    projectNameKey: "resource.tables.projects.socialMedia",
    team: {
      images: [
        "/images/user/user-28.jpg",
        "/images/user/user-29.jpg",
        "/images/user/user-30.jpg",
      ],
    },
    budget: "2.8K",
    status: "cancel",
  },
  {
    id: 5,
    user: {
      image: "/images/user/user-21.jpg",
      nameKey: "resource.tables.users.carlaGeorge",
      roleKey: "resource.tables.roles.frontendDeveloper",
    },
    projectNameKey: "resource.tables.projects.website",
    team: {
      images: [
        "/images/user/user-31.jpg",
        "/images/user/user-32.jpg",
        "/images/user/user-33.jpg",
      ],
    },
    budget: "4.5K",
    status: "active",
  },
];

export default function BasicTableOne() {
  const { t } = useTranslation(["resource-tables", "resource-common"]);
  const statusColor = (status: Order["status"]) => {
    if (status === "active") {
      return "success";
    }
    if (status === "pending") {
      return "warning";
    }
    return "error";
  };

  const statusLabel = (status: Order["status"]) => {
    if (status === "active") {
      return t("resource.common.status.active");
    }
    if (status === "pending") {
      return t("resource.common.status.pending");
    }
    return t("resource.common.status.cancelled");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("resource.tables.headers.user")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("resource.tables.headers.project")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("resource.tables.headers.team")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("resource.tables.headers.status")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {t("resource.tables.headers.budget")}
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full">
                        <Image
                          width={40}
                          height={40}
                          src={order.user.image}
                          alt={t(order.user.nameKey)}
                        />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {t(order.user.nameKey)}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {t(order.user.roleKey)}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {t(order.projectNameKey)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex -space-x-2">
                      {order.team.images.map((teamImage, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 overflow-hidden border-2 border-white rounded-full dark:border-gray-900"
                        >
                          <Image
                            width={24}
                            height={24}
                            src={teamImage}
                            alt={t("resource.tables.teamMemberAlt", {
                              index: index + 1,
                            })}
                            className="w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={statusColor(order.status)}
                    >
                      {statusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {order.budget}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
