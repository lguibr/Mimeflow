import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 }
    );
  }

  try {
    // Filter headers to pass to the target
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range) {
      headers.set("range", range);
    }

    const response = await fetch(targetUrl, {
      headers: {
        ...Object.fromEntries(headers),
        Referer: "https://www.youtube.com/",
        "User-Agent":
          "com.google.android.youtube/19.29.35 (Linux; U; Android 14; en_US; Pixel 8)",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Proxy fetch failed:", {
        url: targetUrl,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return NextResponse.json(
        { error: "Proxy fetch failed", details: errorText },
        { status: response.status }
      );
    }

    console.log("Proxy fetch response:", {
      url: targetUrl,
      status: response.status,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    });

    // Create a new response with the body from the fetch
    const newResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy relevant headers
    const headersToCopy = ["content-type", "content-range", "accept-ranges"];

    headersToCopy.forEach((header) => {
      const value = response.headers.get(header);
      if (value) {
        newResponse.headers.set(header, value);
      }
    });

    newResponse.headers.set("Access-Control-Allow-Origin", "*");

    return newResponse;
  } catch (error) {
    console.error("Error proxying request:", error);
    return NextResponse.json(
      { error: "Failed to proxy request" },
      { status: 500 }
    );
  }
}
