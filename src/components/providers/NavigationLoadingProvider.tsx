"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SpinnerLarge from "@/components/common/SpinnerLarge";

export default function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href && !link.target) {
        const url = new URL(link.href);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return (
    <>
      {children}
      {isNavigating && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900">
          <SpinnerLarge />
        </div>
      )}
    </>
  );
}
