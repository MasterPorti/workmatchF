"use client";

import Link from "next/link";
import {
  HiHome,
  HiBriefcase,
  HiUserGroup,
  HiClipboardList,
  HiDocumentText,
} from "react-icons/hi";

export default function Sidebar() {
  return (
    <div className="w-16 h-full flex flex-col items-center py-4 border-r border-gray-700 bg-gray-900">
      <div className="mb-8">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16 0C7.163 0 0 7.163 0 16C0 24.837 7.163 32 16 32C24.837 32 32 24.837 32 16C32 7.163 24.837 0 16 0ZM16 4C22.627 4 28 9.373 28 16C28 22.627 22.627 28 16 28C9.373 28 4 22.627 4 16C4 9.373 9.373 4 16 4Z"
            fill="#EE4266"
          />
          <path
            d="M16 8C11.582 8 8 11.582 8 16C8 20.418 11.582 24 16 24C20.418 24 24 20.418 24 16C24 11.582 20.418 8 16 8ZM16 12C18.209 12 20 13.791 20 16C20 18.209 18.209 20 16 20C13.791 20 12 18.209 12 16C12 13.791 13.791 12 16 12Z"
            fill="#EE4266"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/home-empresas"
          className="w-10 h-10 rounded-full flex justify-center items-center hover:bg-gray-800 cursor-pointer transition-all duration-300 group"
        >
          <HiHome className="text-2xl text-gray-400 group-hover:text-[#EE4266] transition-colors duration-300" />
        </Link>
        <Link
          href="/gestionar-vacantes-empresas"
          className="w-10 h-10 rounded-full flex justify-center items-center hover:bg-gray-800 cursor-pointer transition-all duration-300 group"
        >
          <HiBriefcase className="text-2xl text-gray-400 group-hover:text-[#EE4266] transition-colors duration-300" />
        </Link>
      </div>
    </div>
  );
}
