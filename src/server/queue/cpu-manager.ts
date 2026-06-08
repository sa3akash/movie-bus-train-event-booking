import os from "os";

// Detect total logical cores
const TOTAL_CORES = os.cpus().length;

// Target 80% CPU utilization
// Ensure we always have at least 1 core for the target
const TARGET_CORES = Math.max(1, Math.floor(TOTAL_CORES * 0.8));

export const resourceManager = {
  getTranscodeWorkerConcurrency: (): number => {
    // Determine how many parallel jobs. Max 4 to avoid disk IO bottleneck,
    // but scale down to 1 on lower-end systems.
    return Math.min(4, Math.max(1, Math.floor(TARGET_CORES / 2)));
  },
  
  getFfmpegThreads: (): number => {
    // Distribute available target cores evenly among concurrent transcode jobs
    const concurrency = resourceManager.getTranscodeWorkerConcurrency();
    return Math.max(1, Math.floor(TARGET_CORES / concurrency));
  },
  
  getAnalyzeWorkerConcurrency: (): number => {
    // Analyze tasks are I/O heavy (downloading, thumbnailing)
    return Math.min(2, Math.max(1, Math.floor(TARGET_CORES / 4)));
  },
  
  getPackageUploadConcurrency: (): number => {
    // Packaging and uploading is mostly I/O bound
    return Math.min(2, Math.max(1, Math.floor(TARGET_CORES / 4)));
  },
  
  getSharpConcurrency: (): number => {
    // Limit sharp to prevent CPU stealing from ffmpeg
    return Math.max(1, Math.floor(TARGET_CORES / 2));
  }
};
