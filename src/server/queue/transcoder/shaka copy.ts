import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { TargetResolution } from "./ffmpeg";

function normalize(p: string) {
  return p.replace(/\\/g, "/");
}

export function runShakaPackager(
  audioPath: string,
  workDir: string,
  outputDir: string,
  targetRes: TargetResolution[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const shakaArgs: string[] = [];

    const audio = normalize(audioPath);
    const work = normalize(workDir);
    const out = normalize(outputDir);

    // 🎧 Audio
    shakaArgs.push(
      `in=${audio},stream=audio,output=${out}/audio.mp4,playlist_name=audio.m3u8,hls_group_id=audio,hls_name=ENGLISH`
    );

    // 🎥 Video
    for (const res of targetRes) {
      const videoInput = normalize(
        path.join(work, `video_${res.name}.mp4`)
      );

      shakaArgs.push(
        `in=${videoInput},stream=video,output=${out}/video_${res.name}.mp4,playlist_name=video_${res.name}.m3u8,iframe_playlist_name=video_${res.name}_iframe.m3u8`
      );
    }

    // 📦 Outputs
    shakaArgs.push("--mpd_output", `${out}/manifest.mpd`);
    shakaArgs.push("--hls_master_playlist_output", `${out}/master.m3u8`);
    shakaArgs.push("--segment_duration", "4");

    console.log("🚀 Shaka args:\n", shakaArgs.join("\n"));

    const shakaProcess = spawn("packager", shakaArgs, {
      stdio: "inherit",
      shell: true, // ✅ IMPORTANT FIX
    });

    shakaProcess.on("error", (err) => {
      reject(err);
    });

    shakaProcess.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Shaka Packager exited with code ${code}`));
      }
    });
  });
}