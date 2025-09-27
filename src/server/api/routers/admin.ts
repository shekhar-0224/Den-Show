import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { eq, isNull } from "drizzle-orm";
import {
  EgressClient,
  EncodingOptionsPreset,
  IngressClient,
  IngressInput,
  RoomServiceClient,
  S3Upload,
  SegmentedFileOutput,
} from "livekit-server-sdk";
import { env } from "~/env";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";
import { streamMetrics } from "~/server/db/schema";
import {
  EGRESS_CLIENT,
  INGRESS_CLIENT,
  ROOM_SERVICE_CLIENT,
} from "~/server/lib/server-utils";

const s3 = new S3Client({
  region: "auto",
  endpoint: env.R2_STREAMS_BUCKET_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_ACCESS_KEY_SECRET,
  },
  forcePathStyle: true,
});

export const adminRouter = createTRPCRouter({
  nukeR2: adminProcedure.query(async ({ ctx }) => {
    const Bucket = env.R2_STREAMS_BUCKET_NAME;
    let cont: string | undefined;
    let deleted = 0;
    do {
      const r = await s3.send(
        new ListObjectsV2Command({
          Bucket,
          ContinuationToken: cont,
          MaxKeys: 1000,
        }),
      );
      // biome-ignore lint/style/noNonNullAssertion: <explanation>
      for (const Key of (r.Contents ?? []).map((o) => o.Key!).filter(Boolean)) {
        try {
          await s3.send(new DeleteObjectCommand({ Bucket, Key }));
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

  deleteAllIngresses: adminProcedure.query(async () => {
    const ingressClient = new IngressClient(
      env.NEXT_PUBLIC_LIVEKIT_URL,
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
    );

    const ingresses = await ingressClient.listIngress({});

    console.log({ ingresses });

    for (const ingress of ingresses) {
      await ingressClient.deleteIngress(ingress.ingressId);
    }

    return {
      message: "Ingresses deleted",
    };
  }),

  startIngressAndEgress: adminProcedure.query(async () => {
    const roomName = "mizan";

    const roomService = new RoomServiceClient(
      env.NEXT_PUBLIC_LIVEKIT_URL,
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
    );

    const opts = {
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      // maxParticipants: 20,
    };
    const room = await roomService.createRoom(opts);

    console.log("room created", room);

    const ingressClient = new IngressClient(
      env.NEXT_PUBLIC_LIVEKIT_URL,
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
    );

    const ingressOptions = {
      name: "Test ingress",
      roomName,
      participantIdentity: "Test participant",
      participantName: "Test participant",
      enableTranscoding: true,
    };

    const ingress = await ingressClient.createIngress(
      IngressInput.RTMP_INPUT,
      ingressOptions,
    );

    console.log("RTMP Ingress created", ingress);

    const egressOptions = {
      segments: new SegmentedFileOutput({
        filenamePrefix: roomName,
        segmentDuration: 2,
        output: {
          case: "s3",
          value: new S3Upload({
            accessKey: env.S3_ACCESS_KEY_ID,
            secret: env.S3_ACCESS_KEY_SECRET,
            bucket: env.R2_STREAMS_BUCKET_NAME,
            endpoint: env.R2_STREAMS_BUCKET_ENDPOINT,
            forcePathStyle: true,
          }),
        },
      }),
    };

    const egressClient = new EgressClient(env.NEXT_PUBLIC_LIVEKIT_URL);

    const egress = await egressClient.startRoomCompositeEgress(
      roomName,
      egressOptions,
      {
        layout: "grid",
        encodingOptions: EncodingOptionsPreset.H264_1080P_30,
        audioOnly: false,
      },
    );

    console.log("S3 Egress created", egressClient);

    return {
      streamUrl: ingress.url,
      streamKey: ingress.streamKey,
      ingressId: ingress.ingressId,
      egressId: egress.egressId,
    };
  }),

  listIngressAndEgress: adminProcedure.query(async () => {
    const ingressClient = new IngressClient(
      env.NEXT_PUBLIC_LIVEKIT_URL,
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
    );

    const ingresses = await ingressClient.listIngress({});

    console.log("RTMP Ingresses", ingresses);

    const egressClient = new EgressClient(env.NEXT_PUBLIC_LIVEKIT_URL);

    const egresses = await egressClient.listEgress({});

    console.log("S3 Egresses", egresses);

    return {
      ingresses,
      egresses,
    };
  }),

  stopIngressAndEgress: adminProcedure.query(async () => {
    const ingressId = "IN_wLfnLzxoWNU9";
    const egressId = "EG_4bBHDa6ZqZgb";

    const ingressClient = new IngressClient(
      env.NEXT_PUBLIC_LIVEKIT_URL,
      env.LIVEKIT_API_KEY,
      env.LIVEKIT_API_SECRET,
    );

    await ingressClient.deleteIngress(ingressId);

    console.log("RTMP Ingress deleted", ingressId);

    const egressClient = new EgressClient(env.NEXT_PUBLIC_LIVEKIT_URL);
    await egressClient.stopEgress(egressId);

    console.log("S3 Egress deleted", egressId);

    const egresses = await egressClient.listEgress();

    console.log("S3 Egresses", egresses);

    return {
      message: "Ingress and Egress stopped",
    };
  }),

  endAllStreams: adminProcedure.query(async ({ ctx }) => {
    const streams = await ctx.db.query.streamMetrics.findMany({
      where: isNull(streamMetrics.endedAt),
    });

    for (const stream of streams) {
      const res = await ROOM_SERVICE_CLIENT.listParticipants(stream.id);

      await ctx.db
        .update(streamMetrics)
        .set({
          endedAt: new Date(),
          views: Math.max(res.length - 1, 0),
        })
        .where(eq(streamMetrics.streamId, stream.streamId));

      await INGRESS_CLIENT.deleteIngress(stream.ingressId);

      console.log("RTMP Ingress deleted", stream.ingressId);

      if (stream.egressId) {
        await EGRESS_CLIENT.stopEgress(stream.egressId);
        console.log("S3 Egress deleted", stream.egressId);
      }
    }

    return {
      message: "Streams ended",
    };
  }),
});
