import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL, API_ENDPOINTS, FILE_BASE_URL } from '../../config/uploadModules';
import './index.less';

const Part4Products = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.list()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: 'products' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || data.code !== 1) {
        throw new Error(data.message || '获取图片列表失败');
      }
      const listData = data.data ?? [];
      const sortedListData = Array.isArray(listData)
        ? [...listData].sort((a, b) => {
            const getName = (item) =>
              typeof item === 'string' ? item : item.name || item.filename || '';
            const getNum = (name) => {
              const match = name.match(/-(\d+)(?:\.[^.]+)?$/);
              return match ? parseInt(match[1], 10) : 0;
            };
            return getNum(getName(a)) - getNum(getName(b));
          })
        : [];
      setImages(sortedListData);
    } catch (err) {
      console.error('获取图片失败:', err.message);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const getFileUrl = (filename) => {
    return `${FILE_BASE_URL}/products/${filename}`;
  };

  const extractDisplayName = (item) => {
    const raw = typeof item === 'string' ? item : item.name || item.filename || '';
    const withoutExt = raw.replace(/\.[^/.]+$/, '');
    return withoutExt.replace(/-\d+$/, '');
  };

  return (
    <section className="part4-products">
      <div className="products-container">
        <h2 className="products-title">{t('products.title')}</h2>
        <div className="products-grid">
          {images.map((item, index) => {
            const imageUrl = typeof item === 'string'
              ? getFileUrl(item)
              : item.url || getFileUrl(item.filename || item.name);
            if (!imageUrl) return null;
            const displayName = extractDisplayName(item);
            return (
              <div key={index} className="product-item">
                <div className="product-card">
                  <div className="product-image-wrapper">
                    <img src={imageUrl} alt={displayName} className="product-image" />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{displayName}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Part4Products;
