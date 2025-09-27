import { useEffect, useState } from "react";

import { useWindowSize } from "usehooks-ts";
import { isMobileDevice } from "~/lib/utils";

interface UseMobileOptions {
  customMobileWidth?: number;
}

export const useMobile = (options?: UseMobileOptions) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const { width } = useWindowSize();

  const mobileWidth = options?.customMobileWidth ?? 480;
  const isMob = width <= mobileWidth;

  useEffect(() => {
    if (isMobileDevice() || isMob) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  }, [isMob]);

  return { isMobile };
};
