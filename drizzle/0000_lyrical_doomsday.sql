CREATE TYPE "public"."loginMethod" AS ENUM('email', 'farcaster');--> statement-breakpoint
CREATE TYPE "public"."accessType" AS ENUM('Open to All', 'Fan Only');--> statement-breakpoint
CREATE TABLE "channel_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"profileUrl" text,
	"bannerUrl" text,
	"name" text NOT NULL,
	"bio" text,
	"handle" text NOT NULL,
	"color" text,
	"fanSubscriptionFee" real DEFAULT 0 NOT NULL,
	"nsfw" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "channel_details_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "channel_metrics" (
	"channelId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"fanCount" integer DEFAULT 0 NOT NULL,
	"subsEarnings" real DEFAULT 0 NOT NULL,
	"tipsEarnings" real DEFAULT 0 NOT NULL,
	"videos" integer DEFAULT 0 NOT NULL,
	"rewardVault" real DEFAULT 0 NOT NULL,
	"earningRate" real DEFAULT 0 NOT NULL,
	"reputationScore" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"displayName" text,
	"loginMethod" "loginMethod" NOT NULL,
	"email" text NOT NULL,
	"farcasterHandle" text,
	"xHandle" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"denWalletAddress" text NOT NULL,
	"earningRate" real DEFAULT 0 NOT NULL,
	"totalSpending" real DEFAULT 0 NOT NULL,
	"totalEarnings" real DEFAULT 0 NOT NULL,
	"updatedAt" timestamp with time zone,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_farcasterHandle_unique" UNIQUE("farcasterHandle"),
	CONSTRAINT "users_xHandle_unique" UNIQUE("xHandle"),
	CONSTRAINT "users_denWalletAddress_unique" UNIQUE("denWalletAddress")
);
--> statement-breakpoint
CREATE TABLE "stream_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"channelId" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnailUrl" text,
	"categories" text[] NOT NULL,
	"accessType" "accessType" DEFAULT 'Open to All' NOT NULL,
	"scheduleAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"superchatStatus" boolean DEFAULT false NOT NULL,
	"superchatPrice" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stream_metrics" (
	"streamId" uuid NOT NULL,
	"channelId" uuid NOT NULL,
	"ingressId" text NOT NULL,
	"streamUrl" text NOT NULL,
	"streamKey" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"likes" integer DEFAULT 0 NOT NULL,
	"collected" integer DEFAULT 0 NOT NULL,
	"tipsEarnings" real DEFAULT 0 NOT NULL,
	"duration" integer DEFAULT 0,
	"startedAt" timestamp with time zone,
	"endedAt" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "channel_details" ADD CONSTRAINT "channel_details_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_metrics" ADD CONSTRAINT "channel_metrics_channelId_channel_details_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channel_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_metrics" ADD CONSTRAINT "channel_metrics_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stream_details" ADD CONSTRAINT "stream_details_channelId_channel_details_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channel_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stream_metrics" ADD CONSTRAINT "stream_metrics_streamId_stream_details_id_fk" FOREIGN KEY ("streamId") REFERENCES "public"."stream_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stream_metrics" ADD CONSTRAINT "stream_metrics_channelId_channel_details_id_fk" FOREIGN KEY ("channelId") REFERENCES "public"."channel_details"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_channel_details_user_id" ON "channel_details" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_channel_details_handle" ON "channel_details" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "idx_channel_details_created_at" ON "channel_details" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_channel_details_nsfw" ON "channel_details" USING btree ("nsfw");--> statement-breakpoint
CREATE INDEX "idx_channel_metrics_channel_id" ON "channel_metrics" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "idx_channel_metrics_user_id" ON "channel_metrics" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_channel_metrics_fan_count" ON "channel_metrics" USING btree ("fanCount");--> statement-breakpoint
CREATE INDEX "idx_channel_metrics_reputation" ON "channel_metrics" USING btree ("reputationScore");--> statement-breakpoint
CREATE INDEX "idx_channel_metrics_user_earnings" ON "channel_metrics" USING btree ("userId","subsEarnings");--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "idx_stream_details_channel_id" ON "stream_details" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "idx_stream_details_schedule_at" ON "stream_details" USING btree ("scheduleAt");--> statement-breakpoint
CREATE INDEX "idx_stream_details_created_at" ON "stream_details" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "idx_stream_metrics_stream_id" ON "stream_metrics" USING btree ("streamId");--> statement-breakpoint
CREATE INDEX "idx_stream_metrics_channel_id" ON "stream_metrics" USING btree ("channelId");--> statement-breakpoint
CREATE INDEX "idx_stream_metrics_channel_started_at" ON "stream_metrics" USING btree ("channelId","startedAt");--> statement-breakpoint
CREATE INDEX "idx_stream_metrics_views" ON "stream_metrics" USING btree ("views");--> statement-breakpoint
CREATE INDEX "idx_stream_metrics_started_at" ON "stream_metrics" USING btree ("startedAt");