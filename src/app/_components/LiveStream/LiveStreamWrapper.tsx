"use client";

import { RoomContext } from "@livekit/components-react";
import "@livekit/components-styles";
import { Room } from "livekit-client";
import { useEffect, useState } from "react";
import { env } from "~/env";
import { api } from "~/trpc/react";
import WatchContent from "../common/WatchContent";
import type { WatchProps } from "../common/WatchWrapper";

export default function LiveStreamWrapper(props: WatchProps) {
  const { mutateAsync: createRoomToken } =
    api.user.createRoomToken.useMutation();

  const [roomInstance] = useState(
    () =>
      new Room({
        adaptiveStream: true, // Optimize video quality for each participant's screen
        dynacast: true, // Enable automatic audio/video quality optimization
      }),
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await createRoomToken({
          room: props.streamId,
        });
        if (!mounted) return;
        if (token) {
          await roomInstance.connect(env.NEXT_PUBLIC_LIVEKIT_URL, token);
        }
      } catch (e) {
        console.error(e);
      }
    })();

    return () => {
      mounted = false;
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  return (
    <RoomContext.Provider value={roomInstance} data-lk-theme="default">
      <WatchContent {...props} />
    </RoomContext.Provider>
  );
}
