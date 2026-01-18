"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useAuthSession } from "@/features/auth/context";
import { useLogout } from "@/features/auth/hooks";
import { useTranslation } from "react-i18next";
import { CaretDown, Lifebuoy, SignOut, UserCircle } from "@phosphor-icons/react";
import type { User } from "@/features/users/types";

const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const firstInitial = firstName?.trim().charAt(0) ?? "";
    const lastInitial = lastName?.trim().charAt(0) ?? "";
    const initials = `${firstInitial}${lastInitial}`.toUpperCase();
    return initials || "";
};

type UserDropdownProps = {
    user: User | undefined;
    userId: number | null;
};

export default function UserDropdown({ user, userId }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { clearSession } = useAuthSession();
    const logoutMutation = useLogout();
    const { t } = useTranslation(["resource-layout", "resource-common"]);

    function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }

    function closeDropdown() {
        setIsOpen(false);
    }

    const fullName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(" ");
    const displayName =
        fullName ||
        (userId
            ? t("resource.layout.userMenu.userWithId", { id: userId })
            : t("resource.layout.userMenu.user"));
    const displayMeta = userId
        ? t("resource.layout.userMenu.userIdMeta", { id: userId })
        : t("resource.layout.userMenu.accountMeta");
    const initials = useMemo(
        () => getInitials(user?.firstName, user?.lastName),
        [user?.firstName, user?.lastName]
    );
    const fallbackInitial = displayName.trim().charAt(0).toUpperCase();
    const avatarUrl = user?.avatarUrl || "";

    const handleSignOut = async () => {
        closeDropdown();
        try {
            await logoutMutation.mutateAsync();
        } catch {
            // Fall through to local cleanup even if logout fails.
        } finally {
            clearSession();
            router.replace("/login");
        }
    };

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
            >
                <span className="mr-3 overflow-hidden rounded-full h-11 w-11 border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={t("resource.layout.userMenu.userAvatarAlt")}
                            className="h-full w-full object-cover"
                            width={44}
                            height={44}
                            unoptimized
                        />
                    ) : (
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-200">
                            {initials || fallbackInitial || "?"}
                        </span>
                    )}
                </span>

                <span className="block mr-1 font-medium text-theme-sm">{displayName}</span>

                <CaretDown
                    size={18}
                    className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={closeDropdown}
                className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
            >
                <div>
                    <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
                        {displayName}
                    </span>
                    <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
                        {displayMeta}
                    </span>
                </div>

                <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            href="/app/profile"
                            className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <UserCircle
                                size={24}
                                className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                            />
                            {t("resource.layout.userMenu.editProfile")}
                        </DropdownItem>
                    </li>
                    {/* <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              <GearSix
                size={24}
                className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
              />
              {t("resource.layout.userMenu.accountSettings")}
            </DropdownItem>
          </li> */}
                    <li>
                        <DropdownItem
                            onItemClick={closeDropdown}
                            tag="a"
                            href="/app/profile"
                            className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                            <Lifebuoy
                                size={24}
                                className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                            />
                            {t("resource.layout.userMenu.support")}
                        </DropdownItem>
                    </li>
                </ul>
                <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                >
                    <SignOut
                        size={24}
                        className="text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300"
                    />
                    {t("resource.layout.userMenu.signOut")}
                </button>
            </Dropdown>
        </div>
    );
}



