import WatchContent from "../common/WatchContent";
import type { WatchProps } from "../common/WatchWrapper";

export default function LiveStreamWrapper(props: WatchProps) {
  return <WatchContent {...props} />;
}
