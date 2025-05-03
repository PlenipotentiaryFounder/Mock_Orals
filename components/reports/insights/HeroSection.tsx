import React from "react";

export function HeroSection({ session, template }: { session: any, template: any }) {
  return (
    <section className="relative rounded-2xl overflow-hidden shadow-lg flex flex-col items-center mb-6 min-h-[220px]">
      {/* Background image with overlay */}
      <img src="/desert-aviation-sunset-view.jpg" alt="Desert Skies Sunset" className="absolute inset-0 w-full h-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/60 via-orange-500/40 to-indigo-700/60" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8">
        <img src="/DesertSkies_LogoTransparent..png" alt="Desert Skies Aviation Logo" className="h-20 mb-4 drop-shadow-xl" />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-lg text-white text-center">You're ready to dominate your checkride!</h1>
        <p className="text-lg md:text-xl font-semibold mb-2 text-white/90 text-center">Session: <span className="font-bold">{session?.session_name || "-"}</span></p>
        <p className="text-base md:text-lg text-white/80 text-center">Template: <span className="font-bold">{template?.name || "-"}</span></p>
      </div>
    </section>
  );
} 