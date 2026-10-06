import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/uploadModules';
import './index.less';

const Part2Trust = () => {
  const { t } = useTranslation();
  const [certImages, setCertImages] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);

  const fetchImages = useCallback(async (folder, setImages, setLoading) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.list()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: folder }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '获取图片列表失败');
      }
      const listData = data.data ?? [];
      setImages(Array.isArray(listData) ? listData : []);
    } catch (err) {
      console.error('获取图片失败:', err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages('certificates', setCertImages, setLoadingCerts);
  }, [fetchImages]);

  const getFileUrl = (folder, filename) => {
    return `${API_BASE_URL}/icons/${folder}/${filename}`;
  };

  return (
    <section className="part2-trust">
      <div className="trust-container">
        {/* Certificates */}
        <div className="trust-section">
          <div className="certificates-bar">
            <div className="cert-logos">
              {certImages.map((item, index) => {
                const filename = typeof item === 'string' ? item : item.name || item.filename;
                const url = typeof item === 'string' ? getFileUrl('certificates', item) : item.url || getFileUrl('certificates', item.filename || item.name);
                return (
                  <img key={index} src={url} alt={filename} className="cert-logo" />
                );
              })}
            </div>
            <div className="cert-divider" />
            <div className="cert-content">
              <h3 className="cert-title">{t('cert.title')}</h3>
              <p className="cert-desc">
                {t('cert.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Part2Trust;
