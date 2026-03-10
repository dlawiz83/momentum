import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Series,
} from "remotion";

export interface RecapVideoProps {
  userName: string;
  weekStart: string;
  weekEnd: string;
  daysActive: number;
  totalEntries: number;
  topCategory: string;
  summaryText: string;
  entries: string[];
  focusAreas: string[];
  mostActiveDay: string;
}

const BG = "#fcfcfc";
const FG = "#141820";
const PRIMARY = "#1e8a5e";
const MUTED = "#6b7280";
const CARD = "#ffffff";
const BORDER = "#e5e7eb";
const BRAND_LIGHT = "#edf7f3";
const SERIF = "'DM Serif Display', Georgia, serif";
const SANS = "'DM Sans', system-ui, sans-serif";

const fadeIn = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

const slideUp = (frame: number, start: number, end: number, distance = 24) =>
  interpolate(frame, [start, end], [distance, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

//  1. Opening
const OpeningSlide = ({
  userName,
  weekStart,
  weekEnd,
}: {
  userName: string;
  weekStart: string;
  weekEnd: string;
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: PRIMARY,
          transform: `scaleX(${fadeIn(frame, 0, 25)})`,
          transformOrigin: "left",
        }}
      />
      <div style={{ textAlign: "center", padding: "0 120px" }}>
        <div
          style={{
            fontSize: 20,
            color: PRIMARY,
            fontFamily: SANS,
            letterSpacing: "5px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: fadeIn(frame, 0, 20),
            marginBottom: 28,
          }}
        >
          Momentum
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            color: FG,
            fontFamily: SERIF,
            lineHeight: 1.15,
            opacity: fadeIn(frame, 12, 38),
            transform: `translateY(${slideUp(frame, 12, 38)}px)`,
          }}
        >
          {userName}'s Week
        </div>
        <div
          style={{
            width: `${interpolate(frame, [32, 52], [0, 140], { extrapolateRight: "clamp" })}px`,
            height: 3,
            backgroundColor: PRIMARY,
            margin: "28px auto",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 26,
            color: MUTED,
            fontFamily: SERIF,
            opacity: fadeIn(frame, 42, 62),
            transform: `translateY(${slideUp(frame, 42, 62, 16)}px)`,
          }}
        >
          {weekStart} – {weekEnd}
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 20,
            color: FG,
            fontFamily: SERIF,
            fontStyle: "italic",
            opacity: fadeIn(frame, 58, 78),
          }}
        >
          Small steps. Real progress.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 48,
          fontSize: 15,
          color: MUTED,
          fontFamily: SANS,
          letterSpacing: "3px",
          fontWeight: 500,
          opacity: fadeIn(frame, 65, 85),
        }}
      >
        YOUR WEEKLY RECAP
      </div>
    </AbsoluteFill>
  );
};

//  2. Activity Summary
const ActivitySlide = ({
  daysActive,
  totalEntries,
  topCategory,
}: {
  daysActive: number;
  totalEntries: number;
  topCategory: string;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const daysProgress = spring({
    frame: frame - 20,
    fps,
    config: { damping: 14, stiffness: 60 },
  });
  const entriesProgress = spring({
    frame: frame - 40,
    fps,
    config: { damping: 14, stiffness: 60 },
  });
  const displayDays = Math.round(
    interpolate(daysProgress, [0, 1], [0, daysActive]),
  );
  const displayEntries = Math.round(
    interpolate(entriesProgress, [0, 1], [0, totalEntries]),
  );
  const categoryIconPaths: Record<string, string> = {
    Learning:
      "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
    Health: "M22 12h-4l-3 9L9 3l-3 9H2",
    Career:
      "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 4.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 11.91a16 16 0 0 0 5.55 5.55l1.21-1.21a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 18z",
    Fitness:
      "M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z m4-7v7 m4-7v7",
    Reading:
      "M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
    Work: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
    Personal: "M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z M2 20a10 10 0 0 1 20 0",
    Other:
      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  };

  const iconPath = categoryIconPaths[topCategory] || categoryIconPaths["Other"];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", padding: "0 100px" }}>
        <div
          style={{
            fontSize: 16,
            color: PRIMARY,
            fontFamily: SANS,
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: fadeIn(frame, 0, 20),
            marginBottom: 44,
          }}
        >
          This Week's Effort
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 20,
            marginBottom: 36,
            opacity: fadeIn(frame, 15, 35),
            transform: `translateY(${slideUp(frame, 15, 35)}px)`,
          }}
        >
          <div
            style={{
              fontSize: 104,
              fontWeight: 400,
              color: PRIMARY,
              fontFamily: SERIF,
              lineHeight: 1,
            }}
          >
            {displayDays}
          </div>
          <div style={{ paddingBottom: 14 }}>
            <div style={{ fontSize: 28, color: FG, fontFamily: SERIF }}>
              days active
            </div>
            <div
              style={{
                fontSize: 18,
                color: MUTED,
                fontFamily: SANS,
                marginTop: 4,
              }}
            >
              out of 7 this week
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 52 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: i < daysActive ? PRIMARY : BORDER,
                opacity: interpolate(frame, [28 + i * 5, 42 + i * 5], [0, 1], {
                  extrapolateRight: "clamp",
                }),
                transform: `scale(${interpolate(frame, [28 + i * 5, 42 + i * 5], [0.3, 1], { extrapolateRight: "clamp" })})`,
              }}
            />
          ))}
        </div>
        <div
          style={{ display: "flex", gap: 24, opacity: fadeIn(frame, 55, 75) }}
        >
          <div
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderRadius: 16,
              padding: "22px 40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 52,
                fontWeight: 400,
                color: FG,
                fontFamily: SERIF,
              }}
            >
              {displayEntries}
            </div>
            <div
              style={{
                fontSize: 15,
                color: MUTED,
                fontFamily: SANS,
                marginTop: 4,
              }}
            >
              wins logged
            </div>
          </div>
          <div
            style={{
              backgroundColor: BRAND_LIGHT,
              border: `1px solid ${PRIMARY}33`,
              borderRadius: 16,
              padding: "22px 40px",
              textAlign: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PRIMARY}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {iconPath.split(" M").map((segment, i) => (
                <path key={i} d={i === 0 ? segment : "M" + segment} />
              ))}
            </svg>
            <div
              style={{
                fontSize: 20,
                fontWeight: 400,
                color: FG,
                fontFamily: SERIF,
                marginTop: 8,
              }}
            >
              {topCategory}
            </div>
            <div
              style={{
                fontSize: 15,
                color: MUTED,
                fontFamily: SANS,
                marginTop: 4,
              }}
            >
              top focus
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 3. Highlight Moments
const HighlightsSlide = ({ entries }: { entries: string[] }) => {
  const frame = useCurrentFrame();
  const visible = entries.slice(0, 5);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", padding: "0 100px" }}>
        <div
          style={{
            fontSize: 16,
            color: PRIMARY,
            fontFamily: SANS,
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: fadeIn(frame, 0, 20),
            marginBottom: 44,
          }}
        >
          Highlight Moments
        </div>
        {visible.map((entry, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 26,
              opacity: fadeIn(frame, 18 + i * 13, 34 + i * 13),
              transform: `translateX(${interpolate(frame, [18 + i * 13, 34 + i * 13], [-32, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: PRIMARY,
                flexShrink: 0,
              }}
            />
            <div
              style={{
                fontSize: 26,
                color: FG,
                fontFamily: SERIF,
                lineHeight: 1.4,
              }}
            >
              {entry.length > 65 ? entry.slice(0, 65) + "…" : entry}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 4. AI Reflection
const ReflectionSlide = ({ summaryText }: { summaryText: string }) => {
  const frame = useCurrentFrame();
  const sentences = summaryText.match(/[^.!?]+[.!?]+/g) || [summaryText];
  const first = sentences.slice(0, 2).join(" ").trim();
  const second = sentences.slice(2, 4).join(" ").trim();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: FG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center", padding: "0 110px" }}>
        <div
          style={{
            fontSize: 16,
            color: PRIMARY,
            fontFamily: SANS,
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: fadeIn(frame, 0, 20),
            marginBottom: 40,
          }}
        >
          Weekly Reflection
        </div>
        <div
          style={{
            fontSize: 34,
            color: "#ffffff",
            fontFamily: SERIF,
            fontStyle: "italic",
            lineHeight: 1.75,
            opacity: fadeIn(frame, 15, 45),
            transform: `translateY(${slideUp(frame, 15, 45)}px)`,
            marginBottom: 28,
          }}
        >
          {first}
        </div>
        {second ? (
          <div
            style={{
              fontSize: 27,
              color: "#a3b0a8",
              fontFamily: SERIF,
              fontStyle: "italic",
              lineHeight: 1.75,
              opacity: fadeIn(frame, 52, 78),
              transform: `translateY(${slideUp(frame, 52, 78)}px)`,
            }}
          >
            {second}
          </div>
        ) : null}
        <div
          style={{
            width: 56,
            height: 3,
            backgroundColor: PRIMARY,
            margin: "48px auto 0",
            borderRadius: 2,
            opacity: fadeIn(frame, 72, 90),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

//  5. Areas of Improvement
const ImprovementSlide = ({ focusAreas }: { focusAreas: string[] }) => {
  const frame = useCurrentFrame();
  const areas =
    focusAreas.length > 0
      ? focusAreas
      : [
          "Continue building consistency",
          "Explore new focus areas",
          "Rest and recharge",
        ];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", padding: "0 100px" }}>
        <div
          style={{
            fontSize: 16,
            color: PRIMARY,
            fontFamily: SANS,
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: fadeIn(frame, 0, 20),
            marginBottom: 16,
          }}
        >
          Looking Ahead
        </div>
        <div
          style={{
            fontSize: 34,
            color: FG,
            fontFamily: SERIF,
            opacity: fadeIn(frame, 10, 30),
            marginBottom: 44,
          }}
        >
          Next week could be an opportunity to...
        </div>
        {areas.slice(0, 3).map((area, i) => (
          <div
            key={i}
            style={{
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              borderLeft: `4px solid ${PRIMARY}`,
              borderRadius: 12,
              padding: "20px 28px",
              marginBottom: 16,
              opacity: fadeIn(frame, 28 + i * 14, 46 + i * 14),
              transform: `translateX(${interpolate(frame, [28 + i * 14, 46 + i * 14], [-28, 0], { extrapolateRight: "clamp" })}px)`,
            }}
          >
            <div style={{ fontSize: 22, color: FG, fontFamily: SANS }}>
              {area}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 6. Weekly Insight
const InsightSlide = ({
  mostActiveDay,
  topCategory,
  totalEntries,
  daysActive,
}: {
  mostActiveDay: string;
  topCategory: string;
  totalEntries: number;
  daysActive: number;
}) => {
  const frame = useCurrentFrame();
  const consistency = Math.round((daysActive / 7) * 100);
  const rows = [
    { label: "Most active day", value: mostActiveDay },
    { label: "Top activity", value: topCategory },
    { label: "Consistency score", value: `${consistency}%` },
    { label: "Total wins this week", value: String(totalEntries) },
  ];
  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", padding: "0 100px" }}>
        <div
          style={{
            fontSize: 16,
            color: PRIMARY,
            fontFamily: SANS,
            letterSpacing: "4px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: fadeIn(frame, 0, 20),
            marginBottom: 48,
          }}
        >
          Weekly Insight
        </div>
        {rows.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${BORDER}`,
              paddingBottom: 22,
              marginBottom: 22,
              opacity: fadeIn(frame, 15 + i * 12, 32 + i * 12),
              transform: `translateY(${slideUp(frame, 15 + i * 12, 32 + i * 12, 14)}px)`,
            }}
          >
            <div style={{ fontSize: 22, color: MUTED, fontFamily: SANS }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 600,
                color: FG,
                fontFamily: SANS,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// 7. Closing
const ClosingSlide = ({ userName }: { userName: string }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundColor: FG,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          backgroundColor: PRIMARY,
        }}
      />
      <div style={{ textAlign: "center", padding: "0 120px" }}>
        <div
          style={{
            fontSize: 20,
            color: PRIMARY,
            fontFamily: SANS,
            letterSpacing: "5px",
            textTransform: "uppercase",
            fontWeight: 600,
            opacity: fadeIn(frame, 0, 25),
            marginBottom: 40,
          }}
        >
          Momentum
        </div>
        <div
          style={{
            fontSize: 58,
            color: "#ffffff",
            fontFamily: SERIF,
            fontStyle: "italic",
            lineHeight: 1.45,
            opacity: fadeIn(frame, 15, 45),
            transform: `translateY(${slideUp(frame, 15, 45)}px)`,
            marginBottom: 16,
          }}
        >
          Small wins today.
          <br />
          <span style={{ color: PRIMARY }}>Big results tomorrow.</span>
        </div>
        <div
          style={{
            marginTop: 52,
            fontSize: 24,
            color: "#8a9e97",
            fontFamily: SERIF,
            opacity: fadeIn(frame, 55, 78),
          }}
        >
          See you next week, {userName}.
        </div>
        <div
          style={{
            marginTop: 56,
            fontSize: 16,
            color: "#4a5e57",
            fontFamily: SANS,
            letterSpacing: "3px",
            fontWeight: 500,
            opacity: fadeIn(frame, 72, 90),
          }}
        >
          KEEP MOVING FORWARD
        </div>
      </div>
    </AbsoluteFill>
  );
};

//  Main composition
export const RecapVideo = (props: RecapVideoProps) => {
  const {
    userName,
    weekStart,
    weekEnd,
    daysActive,
    totalEntries,
    topCategory,
    summaryText,
    entries,
    focusAreas,
    mostActiveDay,
  } = props;
  return (
    <Series>
      <Series.Sequence durationInFrames={130}>
        <OpeningSlide
          userName={userName}
          weekStart={weekStart}
          weekEnd={weekEnd}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={160}>
        <ActivitySlide
          daysActive={daysActive}
          totalEntries={totalEntries}
          topCategory={topCategory}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={160}>
        <HighlightsSlide entries={entries} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={180}>
        <ReflectionSlide summaryText={summaryText} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={150}>
        <ImprovementSlide focusAreas={focusAreas} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={180}>
        <InsightSlide
          mostActiveDay={mostActiveDay}
          topCategory={topCategory}
          totalEntries={totalEntries}
          daysActive={daysActive}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={160}>
        <ClosingSlide userName={userName} />
      </Series.Sequence>
    </Series>
  );
};
