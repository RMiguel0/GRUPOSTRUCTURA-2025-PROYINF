import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";

/**
 * Componente de prueba de vida (liveness) que utiliza la librería
 * face-api.js para detectar el rostro del usuario y exigir un
 * parpadeo y un giro leve de la cabeza. Cuando ambas acciones
 * son detectadas se ejecuta el callback onPassed.
 *
 * Para que funcione correctamente, es necesario descargar los
 * modelos de face-api.js (tiny_face_detector, face_landmark_68, etc.)
 * y ubicarlos en la carpeta `public/models`. Puedes obtenerlos desde
 * https://github.com/justadudewhohacks/face-api.js/tree/master/weights
 *
 * @param {function} onPassed - Callback que se invoca cuando el usuario
 * ha pasado la prueba de vida.
 */
export default function LivenessCheck({ onPassed }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Cargando modelos...");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        setLoaded(true);
        setStatus("Inicia la cámara…");
      } catch (err) {
        console.error("Error loading face-api models", err);
        setStatus("No se pudieron cargar los modelos de detección de rostro.");
      }
    }
    loadModels();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    let stream;
    let animationFrame;
    let lastEAR = 0;
    let blinkOk = false;
    let yawOk = false;

    // EAR: Eye aspect ratio para detectar parpadeo
    function eyeAspectRatio(pts) {
      const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      const A = dist(pts[1], pts[5]);
      const B = dist(pts[2], pts[4]);
      const C = dist(pts[0], pts[3]);
      return (A + B) / (2.0 * C);
    }

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current.play();
          setStatus(
            "Mira la cámara. Parpadea y gira levemente la cabeza (izquierda o derecha)."
          );
          runDetection();
        }
      } catch (err) {
        console.error("Error accessing camera", err);
        setStatus(
          "No se pudo acceder a la cámara. Asegúrate de otorgar permisos y tener una cámara disponible."
        );
      }
    }

    async function runDetection() {
      if (!videoRef.current) return;
      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();
      if (det) {
        const landmarks = det.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const jaw = landmarks.getJawOutline();
        const nose = landmarks.getNose();
        // Calcular EAR promedio de ambos ojos
        const ear = (eyeAspectRatio(leftEye) + eyeAspectRatio(rightEye)) / 2;
        // Detectar parpadeo cuando el EAR disminuye drásticamente respecto al frame anterior
        if (lastEAR && lastEAR - ear > 0.08) {
          blinkOk = true;
        }
        lastEAR = ear;
        // Detectar giro de cabeza: relacionar la posición de la punta de la nariz con la mandíbula
        const noseTip = nose[3];
        const jawLeft = jaw[2];
        const jawRight = jaw[14];
        const centerX = (jawLeft.x + jawRight.x) / 2;
        const yaw = (noseTip.x - centerX) / (jawRight.x - jawLeft.x);
        if (Math.abs(yaw) > 0.08) {
          yawOk = true;
        }
        // Actualizar estado para mostrar al usuario
        setStatus(
          `Liveness: ${blinkOk ? "Parpadeo ✔" : "Parpadeo ✖"} | ${
            yawOk ? "Giro ✔" : "Giro ✖"
          }`
        );
        if (blinkOk && yawOk) {
          // Detener detección y cerrar cámara
          setStatus("Prueba de vida superada ✅");
          if (onPassed) onPassed();
          return;
        }
      } else {
        setStatus(
          "No detecto rostro. Aclara la iluminación y mira a la cámara."
        );
      }
      animationFrame = requestAnimationFrame(runDetection);
    }

    startCamera();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [loaded, onPassed]);

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        playsInline
        muted
        className="rounded-lg w-full max-w-sm h-auto bg-black"
      />
      <p className="text-sm text-gray-700">{status}</p>
    </div>
  );
}