"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyBackgroundManager() {
  const pathname = usePathname();

  useEffect(() => {
    const shouldHaveBlackBg =
      pathname.includes("/live") ||
      pathname.includes("/watch") ||
      pathname.includes("/clip");

    if (shouldHaveBlackBg) {
      document.body.classList.add("bg-black");
      document.body.classList.remove("bg-white");
    } else {
      document.body.classList.add("bg-white");
      document.body.classList.remove("bg-black");
    }

    return () => {
      document.body.classList.remove("bg-black", "bg-white");
    };
  }, [pathname]);

  return null;
}
