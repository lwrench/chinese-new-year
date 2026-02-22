import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import "./App.css";

/**
 * Chinese New Year dates (Spring Festival / 除夕 next day)
 * Source: astronomical calculations for years 2025–2036
 */
const CNY_DATES: [number, number, number][] = [
  [2025, 1, 29],
  [2026, 2, 17],
  [2027, 2, 6],
  [2028, 1, 26],
  [2029, 2, 13],
  [2030, 2, 3],
  [2031, 1, 23],
  [2032, 2, 11],
  [2033, 1, 31],
  [2034, 2, 19],
  [2035, 2, 8],
  [2036, 1, 28],
];

function getNextCNY(): Date {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const [y, m, d] of CNY_DATES) {
    const cny = new Date(y, m - 1, d);
    if (cny >= today) return cny;
  }
  // Fallback: return last known + 1 year (rough)
  const last = CNY_DATES[CNY_DATES.length - 1];
  return new Date(last[0] + 1, last[1] - 1, last[2]);
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bDay.getTime() - aDay.getTime()) / msPerDay);
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

function App() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const daysLeft = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return daysBetween(today, getNextCNY());
  }, []);

  // Show a brief toast notification
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  // Capture card to canvas
  const captureCard = async (): Promise<HTMLCanvasElement | null> => {
    if (!cardRef.current) return null;
    return html2canvas(cardRef.current, {
      backgroundColor: "#1e1e1e",
      scale: 2,
      useCORS: true,
    });
  };

  // Desktop: copy image to clipboard
  const copyToClipboard = async () => {
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          showToast("已复制到剪贴板 ✅");
        } catch {
          showToast("复制失败，请重试");
        }
      }, "image/png");
    } catch {
      showToast("复制失败，请重试");
    }
  };

  // Mobile: download image
  const downloadImage = async () => {
    try {
      const canvas = await captureCard();
      if (!canvas) return;
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `过年倒计时-${daysLeft}天.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("已保存图片 ✅");
    } catch {
      showToast("保存失败，请重试");
    }
  };

  const handleClick = () => {
    if (isMobile()) {
      downloadImage();
    } else {
      copyToClipboard();
    }
  };

  // Update title
  useEffect(() => {
    document.title = `距过年还剩 ${daysLeft} 天`;
  }, [daysLeft]);

  return (
    <div className="page-container" onClick={handleClick}>
      {toast && <div className="toast">{toast}</div>}

      <div className="countdown-card" ref={cardRef}>
        <div className="text-block">
          <div className="title">距离过年</div>
          <div className="subtitle-row">
            <div className="red-bar" />
            <div className="subtitle-text">还剩</div>
          </div>
          <div className="bottom-text">
            <div className="en-line">FFFFUCK JOB!!!!!!</div>
            <div className="en-line">IN {daysLeft} DAYS</div>
          </div>
        </div>
        <div className="number-block">
          <span className="days-number">{daysLeft}</span>
          <span className="days-unit">天</span>
        </div>
      </div>

      <div className="hint">
        {isMobile() ? "点击保存图片" : "点击任意位置复制图片"}
      </div>
    </div>
  );
}

export default App;
