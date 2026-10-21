import type { Article } from "@/data/articles";
import { rgba } from "@/og/color";

const palette = {
  ink: "#0a0908",
  black: "#000000",
  cream: "#f7f1e6",
  amber: "#ffb930",
  amberDeep: "#e39a2b",
  amberDark: "#7a4b17",
  amberInk: "#5a3a12",
};

function Tag({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginRight: 10,
        padding: "10px 18px",
        borderRadius: 999,
        backgroundColor: muted
          ? rgba(palette.cream, 0.4)
          : rgba(palette.cream, 0.55),
        border: `1px solid ${rgba(palette.ink, 0.12)}`,
        fontFamily: "Space Mono",
        fontSize: 22,
        letterSpacing: 1.2,
        color: muted ? rgba(palette.ink, 0.6) : palette.amberDark,
      }}
    >
      {label.replace(/-/g, " ").toUpperCase()}
    </div>
  );
}

export function ArticleOgImage({
  article,
  cover,
  coverBlur,
  grain,
}: {
  article: Article;
  cover?: string;
  coverBlur?: string;
  grain: string;
}) {
  const tags = article.tags.slice(0, 3);
  const extraTags = article.tags.length - tags.length;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: palette.ink,
        color: palette.cream,
        fontFamily: "Inter",
        overflow: "hidden",
      }}
    >
      {cover ? (
        <img
          src={cover}
          alt=""
          width={1200}
          height={630}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(circle at 80% 10%, ${palette.amberDeep} 0%, ${palette.amberDark} 38%, ${palette.ink} 78%)`,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `linear-gradient(180deg, ${rgba(palette.ink, 0.62)} 0%, ${rgba(palette.ink, 0.08)} 30%, ${rgba(palette.ink, 0.42)} 58%, ${rgba(palette.ink, 0.9)} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `radial-gradient(circle at 88% 8%, ${rgba(palette.amber, 0.26)} 0%, ${rgba(palette.amber, 0)} 46%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: 0,
          right: 0,
          height: 150,
          backgroundImage: `linear-gradient(180deg, ${rgba(palette.ink, 0.92)} 0%, ${rgba(palette.ink, 0.55)} 48%, ${rgba(palette.ink, 0)} 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${grain})`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          opacity: 0.11,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 44,
          left: 60,
          right: 60,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "UnifrakturMaguntia",
              fontSize: 30,
              lineHeight: 1.1,
              color: palette.cream,
              textShadow: `0 2px 14px ${rgba(palette.ink, 0.9)}`,
            }}
          >
            Firman Lestari
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 4,
              fontFamily: "Space Mono",
              fontSize: 22,
              letterSpacing: 1.6,
              color: rgba(palette.cream, 0.9),
            }}
          >
            SOFTWARE ENGINEER
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Space Mono",
              fontSize: 22,
              letterSpacing: 1.2,
              color: palette.cream,
              textShadow: `0 2px 12px ${rgba(palette.ink, 0.9)}`,
            }}
          >
            {article.date.toUpperCase()}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 6,
              fontFamily: "Space Mono",
              fontSize: 22,
              letterSpacing: 1.2,
              color: rgba(palette.cream, 0.68),
              textShadow: `0 2px 12px ${rgba(palette.ink, 0.9)}`,
            }}
          >
            {`${article.readingTime} READ`.toUpperCase()}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 36,
          display: "flex",
          flexDirection: "column",
          padding: "34px 40px 36px",
          borderRadius: 2,
          backgroundColor: rgba(palette.cream, 0.72),
          boxShadow: `0 18px 40px ${rgba(palette.black, 0.28)}`,
          overflow: "hidden",
        }}
      >
        {coverBlur && (
          <img
            src={coverBlur}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              left: -40,
              bottom: -36,
              width: 1200,
              height: 630,
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: rgba(palette.cream, 0.16),
            boxShadow: `inset 0 0 0 1px ${rgba(palette.cream, 0.35)}`,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Space Mono",
              fontSize: 22,
              letterSpacing: 1.6,
              color: palette.amberInk,
            }}
          >
            {(article.category ?? "ARTICLE").toUpperCase()}
          </div>
        </div>

        <div
          style={{
            display: "block",
            lineClamp: 3,
            maxWidth: 1020,
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: -1.8,
            lineHeight: 1.06,
            color: palette.ink,
          }}
        >
          {article.title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          {tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
          {extraTags > 0 && <Tag label={`+${extraTags}`} muted />}
        </div>
      </div>
    </div>
  );
}
