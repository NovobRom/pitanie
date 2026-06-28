'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Camera } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetected, onClose }: BarcodeScannerProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [active, setActive] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    startScanner();
    return () => stopScanner();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startScanner() {
    try {
      // BarcodeDetector is available in Chrome 83+ and Safari 17+
      const BarcodeDetector = (window as any).BarcodeDetector;
      if (!BarcodeDetector) {
        // Fallback: use ZXing
        await startZXing();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      detectorRef.current = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });
      setActive(true);
      scanLoop();
    } catch {
      setError(t('barcode.error'));
    }
  }

  function scanLoop() {
    if (!videoRef.current || !detectorRef.current) return;

    detectorRef.current.detect(videoRef.current).then((codes: any[]) => {
      if (codes.length > 0) {
        stopScanner();
        onDetected(codes[0].rawValue);
      } else {
        rafRef.current = requestAnimationFrame(scanLoop);
      }
    }).catch(() => {
      rafRef.current = requestAnimationFrame(scanLoop);
    });
  }

  async function startZXing() {
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);

      // Poll using decodeOnceFromVideoDevice
      const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current!);
      stopScanner();
      onDetected(result.getText());
    } catch {
      setError(t('barcode.error'));
    }
  }

  function stopScanner() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  return (
    <div className="fixed inset-0 z-60 flex flex-col bg-black">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 pt-safe-top pt-4 pb-3 bg-black/80">
        <div className="flex items-center gap-2 text-white">
          <Camera size={18} />
          <span className="text-sm font-semibold">{t('barcode.scanning')}</span>
        </div>
        <button
          onClick={() => { stopScanner(); onClose(); }}
          className="text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Video feed */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
        />

        {/* Viewfinder overlay */}
        {active && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-40 relative">
              {/* Corner markers */}
              {[
                'top-0 left-0 border-t-4 border-l-4',
                'top-0 right-0 border-t-4 border-r-4',
                'bottom-0 left-0 border-b-4 border-l-4',
                'bottom-0 right-0 border-b-4 border-r-4',
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-[var(--color-primary)] ${cls} rounded-sm`} />
              ))}
              {/* Scan line */}
              <div className="absolute left-2 right-2 top-1/2 h-0.5 bg-[var(--color-primary)]/70 animate-pulse" />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80">
            <Camera size={40} className="text-white/40" />
            <p className="text-white/70 text-sm text-center px-8">{error}</p>
            <button
              onClick={() => { stopScanner(); onClose(); }}
              className="mt-2 text-white bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-colors"
            >
              {t('share.reset')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
