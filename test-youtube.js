const { Innertube } = require("youtubei.js");

(async () => {
  try {
    console.log("Creating Innertube instance...");
    const innertube = await Innertube.create();
    console.log("Fetching video info for dQw4w9WgXcQ (Rick Roll)...");
    const videoInfo = await innertube.getInfo("dQw4w9WgXcQ", {
      client: "ANDROID",
    });
    console.log("Video info fetched successfully!");
    console.log("Title:", videoInfo.basic_info.title);

    console.log("Generating DASH manifest...");
    const manifest = await videoInfo.toDash();
    console.log("DASH manifest generated successfully!");
    console.log("Manifest length:", manifest.length);
  } catch (error) {
    console.error("Error:", error);
  }
})();
