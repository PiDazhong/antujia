import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL, API_ENDPOINTS, FILE_BASE_URL } from '../../config/uploadModules';
import './index.less';

const Part7Client = () => {
  const { t } = useTranslation();
  const [logoImages, setLogoImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.list()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: 'logo' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '获取图片列表失败');
      }
      const listData = data.data ?? [];
      setLogoImages(Array.isArray(listData) ? listData : []);
    } catch (err) {
      console.error('获取图片失败:', err.message);
      setLogoImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const getFileUrl = (filename) => {
    return `${FILE_BASE_URL}/logo/${filename}`;
  };

  const lastLogo = logoImages[logoImages.length - 1];

  return (
    <section className="part7-client">
      <div className="client-container">
        <h2 className="client-title">{t('trust.title')}</h2>
        <div className="client-logos">
          {lastLogo && (() => {
            const filename = typeof lastLogo === 'string' ? lastLogo : lastLogo.name || lastLogo.filename;
            const url = typeof lastLogo === 'string' ? getFileUrl(lastLogo) : lastLogo.url || getFileUrl(lastLogo.filename || lastLogo.name);
            return (
              <div className="logo-item">
                <img src={url} alt={filename} className="logo-img" />
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
};

export default Part7Client;
