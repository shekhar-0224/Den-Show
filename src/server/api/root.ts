import { streamRouter } from "~/server/api/routers/stream";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { adminRouter } from "./routers/admin";
import { authRouter } from "./routers/auth";
import { channelRouter } from "./routers/channel";
import { clipsRouter } from "./routers/clips";
import { profileRouter } from "./routers/profile";
import { tipRouter } from "./routers/tip";
import { tokenRouter } from "./routers/token";
import { userRouter } from "./routers/user";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  stream: streamRouter,
  channel: channelRouter,
  user: userRouter,
  auth: authRouter,
  admin: adminRouter,
  profile: profileRouter,
  tip: tipRouter,
  token: tokenRouter,
  clips: clipsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
