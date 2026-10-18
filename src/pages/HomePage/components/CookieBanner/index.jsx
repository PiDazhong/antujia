import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSharkText from '../../hooks/useSharkText';
import './index.scss';

const STORAGE_KEY = 'saudi_damons_cookie_consent';

const CookieBanner = () => {
  // header 模块文本（与 Header 共用同一模块）：
  // sharkObj[3] = 提示文案 [4] = 隐私政策链接文案 [5] = 接受按钮文案
  const sharkObj = useSharkText({ module: 'header' });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <p className="cookie-banner-text">
          {sharkObj[3]}{' '}
          <Link to="/privacy" className="cookie-banner-link">
            {sharkObj[4]}
          </Link>
        </p>
        <button className="cookie-banner-btn" onClick={handleAccept}>
          {sharkObj[5]}
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
