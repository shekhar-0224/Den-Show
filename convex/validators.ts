import z from "zod";

export const linkedAccountsSchema = z.array(
  z.union([
    z.object({
      type: z.literal("wallet"),
      address: z.string(),
      chain_type: z.string(),
      id: z.string(),
      wallet_client_type: z.string(),
    }),
    z.object({
      type: z.literal("farcaster"),
      fid: z.number(),
      owner_address: z.string(),
      username: z.string(),
      display_name: z.string(),
      profile_picture_url: z.string(),
    }),
    z.object({
      type: z.literal("twitter_oauth"),
      name: z.string(),
      profile_picture_url: z.string(),
      subject: z.string(),
      username: z.string(),
    }),
    z.object({
      type: z.literal("email"),
      address: z.string(),
    }),
  ])
);
