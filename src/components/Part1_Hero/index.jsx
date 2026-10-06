import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/uploadModules';
import './index.less';

const Part1Hero = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.list()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: 'home' }),
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
    fetchImages();
  }, [fetchImages]);

  const getFileUrl = (filename) => {
    return `${API_BASE_URL}/icons/home/${filename}`;
  };

  const handleScrollToForm = () => {
    const formSection = document.getElementById('contact-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const lastImage = images.length > 0 ? images[images.length - 1] : null;
  const lastImageUrl = lastImage
    ? (typeof lastImage === 'string' ? getFileUrl(lastImage) : lastImage.url || getFileUrl(lastImage.filename || lastImage.name))
    : null;

  return (
    <section className="part1-hero">
      <div className="hero-background">
        <div className="bg-image-placeholder">
          {lastImageUrl ? (
            <img src={lastImageUrl} alt="hero" className="bg-image" />
          ) : null}
          <div className="bg-overlay" />
        </div>
      </div>

      <div className="header-main">
        <div className="header-main-inner">
          <Link to="/" className="header-logo">
            <img src="/damons.png" alt="Damons" className="logo-img" />
          </Link>
        </div>
      </div>

      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            {t('hero.title')}
          </h1>
          <p className="hero-subtitle">
            {t('hero.description')}
          </p>
          <Button
            type="primary"
            size="large"
            className="hero-button"
            onClick={handleScrollToForm}
          >
            {t('hero.button')}
            <ArrowRightOutlined />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Part1Hero;
