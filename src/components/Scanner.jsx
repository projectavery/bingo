import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = ({ onScanSuccess }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render((decodedText) => {
      onScanSuccess(decodedText);
      // Optional: stop scanning after success if needed
      // scanner.clear();
    }, (error) => {
      // console.warn(error);
    });

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [onScanSuccess]);

  return (
    <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
      <div id="reader" style={{ width: '100%' }}></div>
    </div>
  );
};

export default Scanner;
