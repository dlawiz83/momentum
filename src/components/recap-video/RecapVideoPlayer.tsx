import { Player } from "@remotion/player";
import { RecapVideo, RecapVideoProps } from "./RecapVideo";

interface RecapVideoPlayerProps {
  data: RecapVideoProps;
}
const DURATION = 130 + 160 + 160 + 180 + 150 + 180 + 160; // 1090 frames total
const FPS = 30;

export const RecapVideoPlayer = ({ data }: RecapVideoPlayerProps) => {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border shadow-lg">
      <Player
        component={RecapVideo as any}
        inputProps={data}
        durationInFrames={DURATION}
        compositionWidth={1280}
        compositionHeight={720}
        fps={FPS}
        style={{ width: "100%", aspectRatio: "16/9" }}
        controls
        autoPlay
      />
    </div>
  );
};
