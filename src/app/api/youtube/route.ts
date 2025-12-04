import { NextRequest, NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json(
      { error: "Missing videoId parameter" },
      { status: 400 }
    );
  }

  try {
    console.log("Initializing Innertube...");
    // Disable cache to prevent file system write errors in Vercel
    const innertube = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true,
    });

    console.log(`Fetching info for videoId: ${videoId}`);
    const videoInfo = await innertube.getInfo(videoId, { client: "IOS" });

    if (!videoInfo.streaming_data) {
      console.error(
        "Streaming data missing. Playability status:",
        videoInfo.playability_status
      );
      throw new Error(
        `Streaming data not available. Status: ${videoInfo.playability_status?.status}`
      );
    }

    // Filter for MP4 formats to ensure compatibility (avoid VP9/WebM issues)
    if (videoInfo.streaming_data?.adaptive_formats) {
      videoInfo.streaming_data.adaptive_formats =
        videoInfo.streaming_data.adaptive_formats.filter((format) =>
          format.mime_type.includes("mp4")
        );
    }

    console.log("Generating DASH manifest...");
    // Generate DASH manifest
    // We need to rewrite URLs to point to our proxy
    const manifest = await videoInfo.toDash({
      url_transformer: (url) => {
        const proxyUrl = new URL(request.nextUrl.origin + "/api/proxy");
        proxyUrl.searchParams.set("url", url.toString());
        return proxyUrl;
      },
    });

    console.log("Manifest generated successfully.");
    return new NextResponse(manifest, {
      headers: {
        "Content-Type": "application/dash+xml",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    console.error("Error fetching YouTube info:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch video info",
        step: "Fetching/Processing",
        details: error.message || String(error),
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
