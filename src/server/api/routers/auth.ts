import { PrivyClient } from "@privy-io/server-auth";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { z } from "zod";
import { env } from "~/env";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { channelDetails, users } from "~/server/db/schema";
import {
  TOKEN_COOKIE,
  createAndSetToken,
  getPrivyToken,
  verifyPrivyToken,
} from "~/server/lib/server-utils";

export const authRouter = createTRPCRouter({
  loginWithEmail: publicProcedure
    .input(
      z.object({
        email: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await verifyPrivyToken();

        const existingUser = await ctx.db.query.users.findFirst({
          where: eq(users.email, input.email),
        });

        if (existingUser) {
          const channel = await ctx.db.query.channelDetails.findFirst({
            where: eq(channelDetails.userId, existingUser.id),
          });

          await createAndSetToken({
            address: existingUser.denWalletAddress as `0x${string}`,
            userId: existingUser.id,
            username: existingUser.username,
            channelId: channel?.id,
          });

          return existingUser;
        }

        const user = await ctx.db
          .insert(users)
          .values({
            denWalletAddress: input.address,
            email: input.email,
            loginMethod: "email",
            username: input.email.split("@")[0] ?? "",
          })
          .returning();

        const insertedUser = user[0];

        if (!insertedUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Login error",
          });
        }

        await createAndSetToken({
          address: insertedUser.denWalletAddress as `0x${string}`,
          userId: insertedUser.id,
          username: insertedUser.username,
        });

        return insertedUser;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Login error",
        });
      }
    }),

  loginWithFarcaster: publicProcedure
    .input(
      z.object({
        fid: z.string(),
        farcasterHandle: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyPrivyToken();
    }),

  loginWithSocialAccount: publicProcedure
    .input(
      z.object({
        type: z.enum(["twitter", "farcaster"]),
        id: z.string(),
        username: z.string(),
        address: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyPrivyToken();

      if (input.type === "twitter") {
        const existingUser = await ctx.db.query.users.findFirst({
          where: eq(users.xSubject, input.id),
        });

        if (existingUser) {
          const channel = await ctx.db.query.channelDetails.findFirst({
            where: eq(channelDetails.userId, existingUser.id),
          });

          await createAndSetToken({
            address: existingUser.denWalletAddress as `0x${string}`,
            userId: existingUser.id,
            username: existingUser.username,
            channelId: channel?.id,
          });

          return existingUser;
        }

        const user = await ctx.db
          .insert(users)
          .values({
            xSubject: input.id,
            xHandle: input.username,
            loginMethod: "x",
            denWalletAddress: input.address,
            username: input.username,
          })
          .returning();

        const insertedUser = user[0];

        if (!insertedUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Login error",
          });
        }

        await createAndSetToken({
          address: insertedUser.denWalletAddress as `0x${string}`,
          userId: insertedUser.id,
          username: insertedUser.username,
        });

        return insertedUser;
      }
      if (input.type === "farcaster") {
        const existingUser = await ctx.db.query.users.findFirst({
          where: eq(users.farcasterId, input.id),
        });

        if (existingUser) {
          const channel = await ctx.db.query.channelDetails.findFirst({
            where: eq(channelDetails.userId, existingUser.id),
          });

          await createAndSetToken({
            address: existingUser.denWalletAddress as `0x${string}`,
            userId: existingUser.id,
            username: existingUser.username,
            channelId: channel?.id,
          });

          return existingUser;
        }

        const user = await ctx.db
          .insert(users)
          .values({
            loginMethod: "farcaster",
            denWalletAddress: input.address,
            username: input.username,
            farcasterId: input.id,
            farcasterHandle: input.username,
          })
          .returning();

        const insertedUser = user[0];

        if (!insertedUser) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Login error",
          });
        }

        await createAndSetToken({
          address: insertedUser.denWalletAddress as `0x${string}`,
          userId: insertedUser.id,
          username: insertedUser.username,
        });

        return insertedUser;
      }

      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid type",
      });
    }),

  logout: protectedProcedure.mutation(async () => {
    const c = await cookies();
    c.delete(TOKEN_COOKIE);

    return;
  }),

  session: publicProcedure.query(async ({ ctx }) => {
    return ctx.user;
  }),
});
