// utils/faceMatch.js
import * as faceapi from "@vladmandic/face-api";

/**
 * Carga modelos una sola vez desde /models (public/models)
 */
let _modelsLoaded = false;
export async function ensureModels() {
  if (_modelsLoaded) return;
  // Usa los mismos que ya tienes para LivenessCheck
  await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
  await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
  await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
  _modelsLoaded = true;
}

/**
 * Obtiene el descriptor (128-D) de una cara en una imagen File/Blob/URL
 */
export async function descriptorFromImage(imageLike) {
  await ensureModels();
  const img = await toHTMLImage(imageLike);
  const det = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!det) return null;
  return det.descriptor; // Float32Array length 128
}

/**
 * Captura un frame del <video> y retorna el descriptor
 */
export async function descriptorFromVideoFrame(videoEl) {
  await ensureModels();
  const det = await faceapi
    .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!det) return null;
  return det.descriptor;
}

/**
 * Distancia Euclídea entre dos descriptores
 */
export function euclidean(d1, d2) {
  if (!d1 || !d2) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Decide si es la misma persona bajo un umbral.
 * Umbral típico: 0.6 (ajústalo si quieres ser más estricto)
 */
export function isSamePerson(d1, d2, threshold = 0.6) {
  return euclidean(d1, d2) < threshold;
}

/** Helpers */
function toHTMLImage(fileOrUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    if (fileOrUrl instanceof File || fileOrUrl instanceof Blob) {
      const url = URL.createObjectURL(fileOrUrl);
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    } else {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = fileOrUrl;
    }
  });
}
