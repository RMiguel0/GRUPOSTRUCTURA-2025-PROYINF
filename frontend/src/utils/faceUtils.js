// src/utils/faceUtils.js
import * as faceapi from "@vladmandic/face-api";

/**
 * Helpers for face recognition using face-api.js. These functions load the
 * necessary models and compute face descriptors (embeddings) from images or
 * video. The returned descriptors can be compared using Euclidean distance
 * to determine similarity. All model files should be placed under
 * `/public/models` (or `/public/model`) in the frontend so they can be loaded
 * via HTTP. See the README or documentation for details on obtaining the
 * `face_recognition_model` weights.
 */

const MODEL_BASE_PATH = "/models";

let modelsLoaded = false;

/**
 * Load the face detection, landmark and recognition models. Call this once
 * before attempting to compute descriptors. Subsequent calls will be a no-op.
 */
export async function loadFaceModels() {
  if (modelsLoaded) return;
  try {
    // Tiny face detector for quick detection
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_BASE_PATH);
    // 68 point landmark model
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_BASE_PATH);
    // Face recognition model (produces 128-dimension descriptors)
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_BASE_PATH);
    modelsLoaded = true;
  } catch (err) {
    console.error("Error loading face models", err);
    throw err;
  }
}

/**
 * Compute a face descriptor from an image file. Returns null if no face
 * is detected. You should call loadFaceModels() before using this.
 * @param {File|Blob} file Image file containing a face (e.g. scanned ID).
 * @returns {Promise<Float32Array|null>} Descriptor or null.
 */
export async function getFaceDescriptorFromImage(file) {
  // Read file into an HTMLImageElement via createImageBitmap
  const bitmap = await createImageBitmap(file);
  // Create a canvas to draw the bitmap (required for face-api)
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0);
  // Detect face and compute descriptor
  const detections = await faceapi
    .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detections || !detections.descriptor) {
    return null;
  }
  return detections.descriptor;
}

/**
 * Compute a face descriptor from a video element (current frame). Returns
 * null if no face is detected. You should call loadFaceModels() before
 * using this.
 * @param {HTMLVideoElement} videoEl Video element with a face in view.
 * @returns {Promise<Float32Array|null>} Descriptor or null.
 */
export async function getFaceDescriptorFromVideo(videoEl) {
  if (!videoEl) return null;
  const detection = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!detection || !detection.descriptor) return null;
  return detection.descriptor;
}

/**
 * Compute the Euclidean distance between two face descriptors. Lower
 * distances indicate more similarity. A common threshold for the
 * face-api.js descriptors is ~0.5 (lower is more strict, higher is
 * more permissive).
 * @param {Float32Array|number[]} desc1
 * @param {Float32Array|number[]} desc2
 * @returns {number}
 */
export function computeDescriptorDistance(desc1, desc2) {
  if (!desc1 || !desc2) return Infinity;
  // Convert to array of numbers if it's a typed array
  const d1 = Array.from(desc1);
  const d2 = Array.from(desc2);
  if (d1.length !== d2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}