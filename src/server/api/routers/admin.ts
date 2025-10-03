import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { eq, isNull } from "drizzle-orm";
// LiveKit removed - using Mux instead
import { env } from "~/env";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { streamMetrics } from "~/server/db/schema";

const s3 = new S3Client({
  region: "auto",
  endpoint: env.R2_STREAMS_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_KEY_SECRET,
  },
});

export const adminRouter = createTRPCRouter({
  // LiveKit functions disabled - using Mux instead
  deleteAllIngresses: adminProcedure.query(async () => {
    return { ok: true, deleted: 0, message: "LiveKit functions disabled - using Mux instead" };
  }),

  createRoom: adminProcedure.query(async () => {
    return { ok: true, message: "LiveKit functions disabled - using Mux instead" };
  }),

  startEgress: adminProcedure.query(async () => {
    return { ok: true, message: "LiveKit functions disabled - using Mux instead" };
  }),

  listIngressAndEgress: adminProcedure.query(async () => {
    return { ingresses: [], egresses: [], message: "LiveKit functions disabled - using Mux instead" };
  }),

  deleteEgress: adminProcedure.query(async () => {
    return { ok: true, message: "LiveKit functions disabled - using Mux instead" };
  }),

  endAllStreams: adminProcedure.mutation(async ({ ctx }) => {
    const streams = await ctx.db.query.streamMetrics.findMany({
      where: isNull(streamMetrics.endedAt),
    });

    for (const stream of streams) {
      await ctx.db
        .update(streamMetrics)
        .set({
          endedAt: new Date(),
          views: 0, // Mock view count since LiveKit is removed
        })
        .where(eq(streamMetrics.streamId, stream.streamId));

      console.log("Stream ended", stream.streamId);
    }

    return {
      ok: true,
      ended: streams.length,
      message: "All streams ended (LiveKit functions disabled - using Mux instead)",
    };
  }),

  deleteAllStreams: adminProcedure.mutation(async () => {
    const Bucket = env.R2_STREAMS_BUCKET_NAME;
    let deleted = 0;
    let cont: string | undefined;
    do {
      const r = await s3.send(
        new ListObjectsV2Command({ Bucket, ContinuationToken: cont })
      );
      for (const obj of r.Contents ?? []) {
        try {
          await s3.send(new DeleteObjectCommand({ Bucket, Key: obj.Key }));
          deleted++;
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        } catch (e: any) {
          if (!/NoSuchKey/i.test(`${e?.name || e?.code}:${e?.message || ""}`))
            throw e;
        }
      }
      cont = r.IsTruncated ? r.NextContinuationToken : undefined;
    } while (cont);
    return { ok: true, bucket: Bucket, deleted };
  }),
});