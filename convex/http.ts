import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

const createPath = (path: string) => `/api/v0${path}`;

http.route({
  path: createPath("/webhook/mux"),
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const headers = Object.fromEntries(req.headers);
    const body = await req.text();

    await ctx.runAction(internal.mux.handleWebhook, { headers, body });

    return new Response(`Hello from ${req.url}`);
  }),
});

export default http;
