import { CustomFont } from "@cf-wasm/og/workerd";
import { bioData } from "@/data/bio";
import cloudIcon from "@/og/assets/cloud.png?inline";
import codeIcon from "@/og/assets/code.png?inline";
import databaseIcon from "@/og/assets/database.png?inline";
import grain from "@/og/assets/grain.png?inline";
import settingsIcon from "@/og/assets/settings.png?inline";
import { rgba } from "@/og/color";
import inter400 from "@/og/fonts/inter-400.bin";
import inter600 from "@/og/fonts/inter-600.bin";
import inter800 from "@/og/fonts/inter-800.bin";
import spaceMono400 from "@/og/fonts/space-mono-400.bin";
import unifraktur400 from "@/og/fonts/unifraktur-400.bin";

export const ogFonts = [
  new CustomFont("Inter", inter400, { weight: 400 }),
  new CustomFont("Inter", inter600, { weight: 600 }),
  new CustomFont("Inter", inter800, { weight: 800 }),
  new CustomFont("UnifrakturMaguntia", unifraktur400, { weight: 400 }),
  new CustomFont("Space Mono", spaceMono400, { weight: 400 }),
];

const palette = {
  background: "#f8f2e4",
  text: "#181612",
  textStrong: "#1c1a17",
  role: "#7b7467",
  body: "#746d60",
  serviceBody: "#8a8175",
  label: "#8b8275",
  accent: "#e2a437",
  iconTile: "#f8e4b4",
  glowAmber: "#e59b31",
  glowAmberSoft: "#ecad53",
  glowGold: "#f2d185",
  glowBronze: "#e09a3f",
  glowGoldSoft: "#eeb65c",
  glowCream: "#faf6eb",
  divider: "#786446",
  glass: "#fffcf5",
  white: "#ffffff",
  shadow: "#976c2c",
};

const services = [
  {
    title: "Software",
    lines: ["Modern web apps, clean code,", "and scalable architecture."],
    icon: codeIcon,
  },
  {
    title: "Automation",
    lines: ["Streamline repetitive tasks", "with smart automation."],
    icon: settingsIcon,
  },
  {
    title: "Integrations",
    lines: ["Connect your tools, services,", "and data seamlessly."],
    icon: cloudIcon,
  },
  {
    title: "Backend Systems",
    lines: ["Reliable APIs and robust", "infrastructure."],
    icon: databaseIcon,
  },
];

function Glow({ background }: { background: string }) {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: background,
      }}
    />
  );
}

function ServiceRow({
  service,
  first,
}: {
  service: (typeof services)[number];
  first: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 80,
        borderTop: first ? "none" : `1px solid ${rgba(palette.divider, 0.14)}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 42,
          height: 42,
          borderRadius: 11,
          backgroundColor: palette.iconTile,
          marginRight: 15,
        }}
      >
        <img src={service.icon} alt="" width={24} height={24} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 218,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 16,
            fontWeight: 600,
            color: palette.textStrong,
            lineHeight: 1.2,
          }}
        >
          {service.title}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 12,
            color: palette.serviceBody,
            lineHeight: 1.4,
            marginTop: 3,
          }}
        >
          {service.lines.map((line) => (
            <div key={line} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OgImage() {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: palette.background,
        color: palette.text,
        fontFamily: "Inter",
        overflow: "hidden",
      }}
    >
      <Glow
        background={`radial-gradient(circle at 100% 0%, ${rgba(palette.glowAmber, 0.72)} 0%, ${rgba(palette.glowAmberSoft, 0.34)} 27%, ${rgba(palette.background, 0)} 58%)`}
      />
      <Glow
        background={`radial-gradient(circle at 12% 0%, ${rgba(palette.glowGold, 0.5)} 0%, ${rgba(palette.background, 0)} 30%)`}
      />
      <Glow
        background={`radial-gradient(circle at 0% 100%, ${rgba(palette.glowBronze, 0.64)} 0%, ${rgba(palette.background, 0)} 48%)`}
      />
      <Glow
        background={`radial-gradient(circle at 88% 100%, ${rgba(palette.glowGoldSoft, 0.3)} 0%, ${rgba(palette.background, 0)} 38%)`}
      />
      <Glow
        background={`radial-gradient(circle at 58% 42%, ${rgba(palette.glowCream, 0.55)} 0%, ${rgba(palette.glowCream, 0)} 55%)`}
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
          opacity: 0.09,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 62,
          left: 72,
          display: "flex",
          flexDirection: "column",
          width: 692,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "UnifrakturMaguntia",
            fontSize: 50,
            lineHeight: 1.05,
          }}
        >
          Firman Lestari
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 12.5,
            letterSpacing: 1.35,
            color: palette.role,
            marginTop: 2,
          }}
        >
          {bioData.role}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 76,
            fontSize: 61,
            fontWeight: 800,
            letterSpacing: -2.4,
            lineHeight: 1.08,
          }}
        >
          <div style={{ display: "flex" }}>Turn your ideas</div>
          <div style={{ display: "flex", color: palette.accent }}>
            into working software.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 16,
            width: 500,
            fontSize: 20,
            lineHeight: 1.5,
            color: palette.body,
          }}
        >
          <div style={{ display: "flex" }}>
            I build web applications and automation
          </div>
          <div style={{ display: "flex" }}>
            systems that save time and reduce
          </div>
          <div style={{ display: "flex" }}>manual work.</div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 132,
          right: 64,
          display: "flex",
          flexDirection: "column",
          width: 368,
          height: 408,
          padding: 26,
          borderRadius: 18,
          backgroundColor: rgba(palette.glass, 0.84),
          border: `1px solid ${rgba(palette.white, 0.78)}`,
          boxShadow: `0 28px 60px ${rgba(palette.shadow, 0.2)}, 0 2px 6px ${rgba(palette.shadow, 0.08)}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: 28,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Space Mono",
              fontSize: 9.5,
              letterSpacing: 2.4,
              color: palette.label,
            }}
          >
            WHAT I DO
          </div>
        </div>

        {services.map((service, index) => (
          <ServiceRow
            key={service.title}
            service={service}
            first={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
