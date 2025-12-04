import { NextRequest, NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

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
    const innertube = await Innertube.create();
    const videoInfo = await innertube.getInfo(videoId, { client: "ANDROID" });

    // Filter for MP4 formats to ensure compatibility (avoid VP9/WebM issues)
    if (videoInfo.streaming_data?.adaptive_formats) {
      videoInfo.streaming_data.adaptive_formats =
        videoInfo.streaming_data.adaptive_formats.filter((format) =>
          format.mime_type.includes("mp4")
        );
    }

    // Generate DASH manifest
    // We need to rewrite URLs to point to our proxy
    const manifest = await videoInfo.toDash({
      url_transformer: (url) => {
        const proxyUrl = new URL(request.nextUrl.origin + "/api/proxy");
        proxyUrl.searchParams.set("url", url.toString());
        return proxyUrl;
      },
    });

    return new NextResponse(manifest, {
      headers: {
        "Content-Type": "application/dash+xml",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error fetching YouTube info:", error);
    return NextResponse.json(
      { error: "Failed to fetch video info" },
      { status: 500 }
    );
  }
}
