import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/uploadModules';
import 'swiper/swiper-bundle.css';
import './index.less';

const Part6Factory = () => {
  const { t, lang } = useTranslation();
  const [images, setImages] = useState([]);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.list()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: 'factory' }),
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
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const getFileUrl = (filename) => {
    return `${API_BASE_URL}/icons/factory/${filename}`;
  };

  return (
    <section className="part6-factory">
      <div className="factory-container">
        <div className="factory-section">
          <div className="factory-text">
            <h2 className="factory-title">
              {t('factory.title')}
            </h2>
            <p className="factory-desc">
              {t('factory.description')}
            </p>
          </div>
          <div className="factory-image-wrapper">
            {images.length > 0 ? (
              <Swiper
                key={lang}
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                modules={[EffectCoverflow, Autoplay, Pagination]}
                effect="coverflow"
                grabCursor
                centeredSlides
                slidesPerView={1}
                rewind={images.length >= 2}
                loop={false}
                speed={800}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                coverflowEffect={{
                  rotate: 35,
                  stretch: 0,
                  depth: 150,
                  modifier: 1,
                  slideShadows: false,
                }}
                className="factory-swiper"
              >
                {images.map((item, index) => {
                  const url = typeof item === 'string'
                    ? getFileUrl(item)
                    : item.url || getFileUrl(item.filename || item.name);
                  return (
                    <SwiperSlide key={index}>
                      <img src={url} alt={`factory-${index}`} className="factory-image" />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            ) : (
              <div className="factory-image" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Part6Factory;
