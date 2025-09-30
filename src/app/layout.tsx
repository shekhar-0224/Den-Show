import "~/styles/globals.css";

import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "~/components/ui/sonner";
import { cn } from "~/lib/utils";
import { auth } from "~/server/lib/server-utils";
import BodyBackgroundManager from "./_components/common/BodyBackgroundManager";
import Navbar from "./_components/common/Navbar";
import Providers from "./_components/common/Providers";

export const metadata: Metadata = {
  title: "den",
  description:
    "the streaming app where fans turn into investors and grow with their favorite creators.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const creamRegular = localFont({
  src: "./_assets/_fonts/Cream-Regular.woff2",
  variable: "--font-cream-regular",
  weight: "400",
});

const creamMedium = localFont({
  src: "./_assets/_fonts/Cream-Medium.woff2",
  variable: "--font-cream-medium",
  weight: "500",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  weight: ["400", "500", "600", "700"],
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const isAuthed = await auth();

  return (
    <html
      lang="en"
      className={cn(
        instrumentSans.variable,
        creamRegular.variable,
        creamMedium.variable
      )}
    >
      <body className="font-sans">
        <BodyBackgroundManager />
        <Providers>
          {/* <Toaster position="bottom-right" reverseOrder={false} /> */}
          <Toaster />
          <div className="flex flex-col h-screen">
            <Navbar isAuthenticated={isAuthed} />
            {/* <div className="mac-13:h-[111%] mac-13:w-[111%] mac-13:origin-[0%_0%] mac-13:scale-[0.9]"> */}
            <div className="flex-1 overflow-y-scroll">{children}</div>
          </div>
          {/* </div> */}
        </Providers>
      </body>
    </html>
  );
}
