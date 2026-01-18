"use client";
import React, { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/shared/context/SidebarContext";
import {
  CaretDown,
  ChartPie,
  CreditCard,
  DotsThreeOutline,
  Receipt,
  SquaresFour,
  Tag,
  Wallet,
} from "@phosphor-icons/react";
import SidebarWidget from "./SidebarWidget";
import { useTranslation } from "react-i18next";

type NavItem = {
  nameKey: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { nameKey: string; path: string; pro?: boolean; new?: boolean }[];
};

const navItems: NavItem[] = [
  {
    icon: <SquaresFour size={20} />,
    nameKey: "resource.layout.nav.dashboard",
    path: "/app/dashboard",
  },
  {
    icon: <Receipt size={20} />,
    nameKey: "resource.layout.nav.transactions",
    path: "/app/transactions",
  },
  {
    icon: <Wallet size={20} />,
    nameKey: "resource.layout.nav.accounts",
    path: "/app/accounts",
  },
  {
    icon: <CreditCard size={20} />,
    nameKey: "resource.layout.nav.creditCards",
    path: "/app/credit-cards",
  },
  {
    icon: <ChartPie size={20} />,
    nameKey: "resource.layout.nav.categories",
    path: "/app/categories",
  },
  {
    icon: <Tag size={20} />,
    nameKey: "resource.layout.nav.tags",
    path: "/app/tags",
  },
];

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { t } = useTranslation(["resource-layout", "resource-common"]);

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => {
        const isSubmenuOpen =
          resolvedSubmenu?.type === menuType &&
          resolvedSubmenu?.index === index;
        return (
          <li key={nav.path ?? nav.nameKey}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${
                isSubmenuOpen
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={` ${
                  isSubmenuOpen
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{t(nav.nameKey)}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <CaretDown
                  size={20}
                  className={`ml-auto w-5 h-5 transition-transform duration-200  ${
                    isSubmenuOpen
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{t(nav.nameKey)}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: isSubmenuOpen ? "500px" : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.path}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {t(subItem.nameKey)}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            {t("resource.layout.badges.new")}
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge `}
                          >
                            {t("resource.layout.badges.pro")}
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          </li>
        );
      })}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [openSubmenuPath, setOpenSubmenuPath] = useState(pathname);

  const activeSubmenu = (() => {
    const menuTypes: Array<"main" | "others"> = ["main", "others"];
    for (const menuType of menuTypes) {
      const items = menuType === "main" ? navItems : othersItems;
      for (let index = 0; index < items.length; index += 1) {
        const nav = items[index];
        if (nav.subItems?.some((subItem) => subItem.path === pathname)) {
          return { type: menuType, index };
        }
      }
    }
    return null;
  })();

  const resolvedSubmenu =
    openSubmenu && openSubmenuPath === pathname ? openSubmenu : activeSubmenu;

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
    setOpenSubmenuPath(pathname);
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/app/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <Image
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt={t("resource.layout.logoAlt")}
                width={150}
                height={40}
              />
              <Image
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt={t("resource.layout.logoAlt")}
                width={150}
                height={40}
              />
            </>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt={t("resource.layout.logoAlt")}
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  t("resource.layout.sidebar.menu")
                ) : (
                  <DotsThreeOutline size={16} />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {othersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    t("resource.layout.sidebar.others")
                  ) : (
                    <DotsThreeOutline size={16} />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
