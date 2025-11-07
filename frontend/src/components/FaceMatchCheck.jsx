// components/FaceMatchCheck.jsx
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

const MODEL_URL = "/models";
const DIST_THRESHOLD = 0.6; // ajustable

export default function FaceMatchCheck({
  idImageFile,
  idImageDataURL,
  onPassed,
  onFailed,
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [modelsReady, setModelsReady] = useState(false);
  const [status, setStatus] = useState("Cargando modelos…");
  const [docDescriptor, setDocDescriptor] = useState(null);
  const [busy, setBusy] = useState(false);

  // 1) Cargar modelos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        if (!cancelled) {
          setModelsReady(true);
          setStatus("Modelos cargados.");
        }
      } catch (e) {
        console.error(e);
        setStatus("Error cargando modelos.");
      }
    })();
    return () => (cancelled = true);
  }, []);

  // 2) Sacar descriptor del documento (File o dataURL)
  useEffect(() => {
    if (!modelsReady) return;
    let revoked = false;

    (async () => {
      try {
        setStatus("Analizando documento…");

        let src = null;
        if (idImageFile) {
          src = URL.createObjectURL(idImageFile);
        } else if (idImageDataURL) {
          src = idImageDataURL;
        } else {
          setStatus("No se recibió imagen del documento.");
          return;
        }

        const img = await loadImage(src);
        const det = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!det) {
          setStatus("No se detectó rostro en el documento.");
          onFailed && onFailed("no_face_in_id");
        } else {
          setDocDescriptor(det.descriptor);
          setStatus("Documento listo. Iniciando cámara…");
        }

        if (idImageFile && src && !revoked) URL.revokeObjectURL(src);
      } catch (e) {
        console.error(e);
        setStatus("Error analizando documento.");
        onFailed && onFailed("doc_analysis_error");
      }
    })();

    return () => {
      revoked = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelsReady, idImageFile, idImageDataURL]);

  // 3) Cuando tenemos docDescriptor, abrir cámara y comparar (auto)
  useEffect(() => {
    if (!modelsReady || !docDescriptor) return;

    let stream = null;
    let cancelled = false;

    (async () => {
      try {
        setBusy(true);
        setStatus("Abriendo cámara…");
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (cancelled) return;

        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();
        await ensureVideoReady(video);

        setStatus("Detectando rostro en cámara…");
        const liveDet = await detectOneFace(video);
        if (!liveDet) {
          setStatus("No se detectó rostro en cámara.");
          onFailed && onFailed("no_live_face");
          stop(stream);
          setBusy(false);
          return;
        }

        drawBox(canvasRef.current, video, liveDet.detection.box);

        const dist = faceapi.euclideanDistance(docDescriptor, liveDet.descriptor);
        const ok = dist <= DIST_THRESHOLD;

        setStatus(
          ok
            ? `Coincidencia: ✓ (dist=${dist.toFixed(3)})`
            : `No coincide (dist=${dist.toFixed(3)})`
        );

        stop(stream);
        setBusy(false);
        ok ? onPassed && onPassed() : onFailed && onFailed("distance_too_high");
      } catch (e) {
        console.error(e);
        setBusy(false);
        setStatus("Error durante la comparación.");
        onFailed && onFailed("compare_error");
        if (stream) stop(stream);
      }
    })();

    return () => {
      cancelled = true;
      if (stream) stop(stream);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docDescriptor, modelsReady]);

  // Botón de reintento (por si el usuario quiere volver a intentar)
  const handleRetry = async () => {
    if (!modelsReady || !docDescriptor) return;
    setDocDescriptor((d) => d); // no-op, sólo para dejar claro que depende de él
    // volverá a entrar en el effect anterior si prefieres, o podrías duplicar aquí la lógica de captura
  };

  return (
    <div>
      <div className="relative w-full max-w-lg aspect-video bg-black rounded-md overflow-hidden">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="mt-2 flex items-center gap-3">
        <p className="text-sm text-gray-700">{status}</p>
        <button
          type="button"
          disabled={!modelsReady || !docDescriptor || busy}
          onClick={handleRetry}
          className="ml-auto px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

/* helpers */
function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}
async function ensureVideoReady(video) {
  if (video.readyState >= 2) return;
  await new Promise((r) => (video.onloadeddata = r));
}
async function detectOneFace(video) {
  for (let i = 0; i < 20; i++) {
    const det = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (det) return det;
    await new Promise((r) => setTimeout(r, 150));
  }
  return null;
}
function drawBox(canvas, video, box) {
  if (!canvas) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "#22c55e";
  ctx.lineWidth = 3;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
}
function stop(stream) {
  try {
    stream.getTracks().forEach((t) => t.stop());
  } catch {}
}
