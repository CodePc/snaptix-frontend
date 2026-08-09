import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  className?: string;
  isPast?: boolean;
  /** Shown under the QR (e.g. live OTP countdown) */
  caption?: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  data,
  size = 140,
  className = '',
  isPast = false,
  caption,
}) => {
  return (
    <div
      id="qr-code-wrapper"
      className={`relative inline-flex flex-col items-center justify-center p-3 bg-white rounded-xl ${
        isPast ? 'opacity-50 grayscale' : ''
      } ${className}`}
    >
      <QRCodeSVG
        value={data || 'SNAPTIX|pending|000000'}
        size={size}
        level="M"
        includeMargin={false}
        bgColor="#ffffff"
        fgColor={isPast ? '#7b7486' : '#0F0F14'}
      />
      {caption && (
        <p className="mt-2 text-[10px] font-mono text-[#7b7486] text-center max-w-[160px] break-all">
          {caption}
        </p>
      )}
    </div>
  );
};
