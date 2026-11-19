const MAX_WIDTH = 960;

export async function extractFrames(file, count = 3) {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;

  try {
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("I could not read this video file."));
    });

    const canvas = document.createElement("canvas");
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const times = Array.from({ length: count }, (_, i) =>
      duration > 0.4 ? (duration * (i + 0.5)) / count : 0
    );

    const frames = [];
    for (const time of times) {
      await new Promise((resolve) => {
        video.onseeked = () => resolve();
        video.currentTime = Math.min(Math.max(time, 0), Math.max(duration - 0.05, 0));
      });

      const scale = video.videoWidth > MAX_WIDTH ? MAX_WIDTH / video.videoWidth : 1;
      canvas.width = Math.max(2, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(2, Math.round(video.videoHeight * scale));
      canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
      if (blob) {
        frames.push(new File([blob], `frame-${frames.length + 1}.jpg`, { type: "image/jpeg" }));
      }
    }

    if (!frames.length) throw new Error("I could not pull any frames out of this video.");
    return frames;
  } finally {
    URL.revokeObjectURL(url);
  }
}