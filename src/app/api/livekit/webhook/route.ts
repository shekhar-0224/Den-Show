import { eq } from "drizzle-orm";
import {
  EncodingOptionsPreset,
  S3Upload,
  SegmentedFileOutput,
  WebhookReceiver,
} from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { env } from "~/env";
import { db } from "~/server/db";
import { streamMetrics } from "~/server/db/schema";
import { EGRESS_CLIENT } from "~/server/lib/server-utils";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const receiver = new WebhookReceiver(
  env.LIVEKIT_API_KEY,
  env.LIVEKIT_API_SECRET,
);

function r2SegmentsOutput(prefix: string) {
  return {
    segments: new SegmentedFileOutput({
      filenamePrefix: prefix,
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
  } as const;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get("Authorization") ?? "";

  const event = await receiver.receive(rawBody, sig);

  const evt = event.event;
  const roomName: string | undefined = event.room?.name;
  const identity: string | undefined =
    event.ingressInfo?.participantIdentity || event.participant?.identity;

  if (!["ingress_started", "track_published"].includes(evt)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (!roomName || !identity) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: "missing fields",
    });
  }

  const streamId = identity; // UUID string (streamDetails.id)

  // skip if egress already started
  const existing = await db.query.streamMetrics.findFirst({
    where: eq(streamMetrics.streamId, streamId),
  });
  if (existing?.egressId) {
    return NextResponse.json({
      ok: true,
      ignored: true,
      reason: "already started",
    });
  }

  // start egress
  const outputs = r2SegmentsOutput(roomName);

  const started = await EGRESS_CLIENT.startParticipantEgress(
    roomName,
    identity,
    outputs,
    { encodingOptions: EncodingOptionsPreset.H264_1080P_30 },
  );

  await db
    .update(streamMetrics)
    .set({ egressId: started.egressId, startedAt: new Date() })
    .where(eq(streamMetrics.streamId, streamId));

  console.log("[LiveKit] egress started", {
    egressId: started.egressId,
    roomName,
    streamId,
  });
  return NextResponse.json({ ok: true, egressId: started.egressId });
}
