import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { TargetResolution } from "./ffmpeg";

export function runShakaPackager(
  audioPath: string,
  workDir: string,
  outputDir: string,
  targetRes: TargetResolution[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });

    const args: string[] = [];

    const normalize = (p: string) => p.replace(/\\/g, "/");

    // ======================
    // 🎧 AUDIO
    // ======================
    const audioDir = `${outputDir}/audio`;
    fs.mkdirSync(audioDir, { recursive: true });

    args.push(
      [
        `in=${normalize(audioPath)}`,
        "stream=audio",
        `init_segment=${audioDir}/init.mp4`,
        `segment_template=${audioDir}/seg_$Number$.m4s`,
        `playlist_name=audio/audio.m3u8`,
        "hls_group_id=audio",
        "hls_name=ENGLISH",
      ].join(","),
    );

    // ======================
    // 🎥 VIDEO RESOLUTIONS
    // ======================
    for (const res of targetRes) {
      const dir = `${outputDir}/${res.name}`;
      fs.mkdirSync(dir, { recursive: true });

      const input = path
        .join(workDir, `video_${res.name}.mp4`)
        .replace(/\\/g, "/");

      const bitrate = res.bitrate.endsWith("k")
        ? parseInt(res.bitrate) * 1000
        : parseInt(res.bitrate);

      args.push(
        [
          `in=${input}`,
          "stream=video",
          `init_segment=${dir}/init.mp4`,
          `segment_template=${dir}/seg_$Number$.m4s`,

          // 🔥 IMPORTANT: must stay FLAT in master playlist
          `playlist_name=${res.name}/video.m3u8`,
          `iframe_playlist_name=${res.name}/iframe.m3u8`,

          `bandwidth=${bitrate}`,
        ].join(","),
      );
    }

    // ======================
    // 📦 MASTER OUTPUT
    // ======================
    args.push("--hls_master_playlist_output", `${outputDir}/master.m3u8`);
    args.push("--mpd_output", `${outputDir}/manifest.mpd`);
    args.push("--segment_duration", "4");
    args.push("--generate_static_live_mpd"); // type static mpd
    // args.push("--dash_xsylan", "urn:mpeg:dash:subtitle:2014"); // xylan subtitle type

    const proc = spawn("packager", args, {
      stdio: "inherit",
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Shaka exited with code ${code}`));
    });

    proc.on("error", reject);
  });
}
