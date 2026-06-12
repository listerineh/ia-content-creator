// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ffmpeg: any | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function initFFmpegForAudio(): Promise<any> {
  if (ffmpeg) return ffmpeg;

  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { toBlobURL } = await import('@ffmpeg/util');

  ffmpeg = new FFmpeg();

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
}

export async function extractAudioFromVideo(videoFile: File): Promise<File> {
  const ffmpegInstance = await initFFmpegForAudio();

  // Write video file to FFmpeg virtual filesystem
  const videoData = new Uint8Array(await videoFile.arrayBuffer());
  await ffmpegInstance.writeFile('input.mp4', videoData);

  // Extract audio as WAV (mejor para Whisper)
  await ffmpegInstance.exec([
    '-i',
    'input.mp4',
    '-vn', // No video
    '-acodec',
    'pcm_s16le', // PCM 16-bit
    '-ar',
    '16000', // 16kHz sample rate (óptimo para Whisper)
    '-ac',
    '1', // Mono
    'output.wav',
  ]);

  // Read the output file
  const audioData = await ffmpegInstance.readFile('output.wav');

  // Clean up
  await ffmpegInstance.deleteFile('input.mp4');
  await ffmpegInstance.deleteFile('output.wav');

  // Convert to File
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const audioBlob = new Blob([audioData as any], { type: 'audio/wav' });
  return new File([audioBlob], 'audio.wav', { type: 'audio/wav' });
}

export function destroyFFmpegAudio(): void {
  ffmpeg = null;
}
