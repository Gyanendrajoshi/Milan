"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { RefreshCw } from "lucide-react";

const qrcodeRegionId = "html5qr-code-full-region";

export default function QRScanner({ onScan, onError }: { onScan: (data: string) => void, onError: (err: any) => void }) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const isRunningRef = useRef(false);
    const isProcessingRef = useRef(false); // Mutex for switching

    // Camera State
    const [cameras, setCameras] = useState<any[]>([]);
    const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        // Security Check
        if (typeof window !== "undefined" && window.isSecureContext === false) {
            setScanError("Security restriction: Camera requires HTTPS or Localhost.");
            return;
        }

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode(qrcodeRegionId);
        }

        initializeCamera();

        return () => {
            stopScanner();
        };
    }, [retryKey]);

    const stopScanner = async () => {
        if (scannerRef.current && isRunningRef.current) {
            try {
                // Pause UI logic
                isRunningRef.current = false;
                await scannerRef.current.stop();
                scannerRef.current.clear();
                console.log("Scanner stopped successfully");
            } catch (e) {
                console.warn("Stop warning (can be ignored)", e);
            }
        }
    };

    const initializeCamera = async () => {
        try {
            // 1. Get Cameras
            let devices: any[] = [];
            try {
                devices = await Html5Qrcode.getCameras();
            } catch (e: any) {
                throw new Error("Could not access camera list. Check Permissions.");
            }

            if (!devices || devices.length === 0) {
                throw new Error("No Camera Device Found.");
            }

            setCameras(devices);

            // 2. Pick Best Camera
            let bestCam = devices.find(d => d.label.toLowerCase().includes("back") || d.label.toLowerCase().includes("environment"));
            if (!bestCam && devices.length > 1) {
                bestCam = devices[devices.length - 1];
            }
            if (!bestCam) bestCam = devices[0];

            // Wait a bit before starting to ensure DOM is ready
            setTimeout(() => startScanner(bestCam.id), 100);

        } catch (err: any) {
            console.error("Init Error", err);
            setScanError(err.message || "Failed to init camera");
            onError(err);
        }
    };

    const startScanner = async (cameraId: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        setScanError(null);

        const scanner = scannerRef.current;
        if (!scanner) {
            isProcessingRef.current = false;
            return;
        }

        try {
            // Ensure stopped first
            if (isRunningRef.current) {
                console.log("Stopping previous stream...");
                await scanner.stop();
                isRunningRef.current = false;
                // Important: Delay to allow hardware release
                await new Promise(r => setTimeout(r, 300));
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            };

            await scanner.start(
                cameraId,
                config,
                (decodedText) => onScan(decodedText),
                () => { }
            );

            isRunningRef.current = true;
            setActiveCameraId(cameraId);
            console.log("Scanner started with", cameraId);

        } catch (err: any) {
            console.error("Start Error", err);

            let msg = "Failed to start camera.";
            if (err.name === "NotReadableError") {
                msg = "Camera is busy. Please close other apps or refresh.";
            } else if (err.name === "NotAllowedError") {
                msg = "Camera permission denied.";
            } else if (err.name === "NotFoundError") {
                msg = "Camera device not found.";
            } else if (err.message) {
                msg = err.message;
            }

            setScanError(msg);
        } finally {
            isProcessingRef.current = false;
        }
    };

    const handleFlipCamera = () => {
        if (cameras.length <= 1 || !activeCameraId || isProcessingRef.current) return;

        const currentIndex = cameras.findIndex(c => c.id === activeCameraId);
        const nextIndex = (currentIndex + 1) % cameras.length;
        const nextCam = cameras[nextIndex];

        startScanner(nextCam.id);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 relative rounded-lg overflow-hidden">
            {scanError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
                    <p className="text-red-400 font-bold mb-2">Camera Error</p>
                    <p className="text-red-200 text-sm mb-4">{scanError}</p>
                    <button
                        onClick={() => setRetryKey(k => k + 1)}
                        className="bg-white text-black px-4 py-2 rounded text-sm font-bold shadow hover:bg-gray-100"
                    >
                        Retry
                    </button>
                    {/* Manual Fallback */}
                    <p className="mt-4 text-xs text-gray-500">Try switching camera or refresh page.</p>
                </div>
            ) : (
                <>
                    <div id={qrcodeRegionId} className="w-full h-full" />

                    {/* Flip Camera Button */}
                    {cameras.length > 1 && (
                        <button
                            onClick={handleFlipCamera}
                            disabled={isProcessingRef.current}
                            className={`absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10 ${isProcessingRef.current ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/70'
                                }`}
                            title="Switch Camera"
                        >
                            <RefreshCw className={`h-5 w-5 ${isProcessingRef.current ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
