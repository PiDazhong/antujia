import React, { useState, useEffect, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination } from 'swiper/modules';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/uploadModules';
import 'swiper/swiper-bundle.css';
import './index.less';

const Part8Cases = () => {
  const { t, lang } = useTranslation();
  const [images, setImages] = useState([]);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.list()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: 'eg' }),
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
    return `${API_BASE_URL}/icons/eg/${filename}`;
  };

  return (
    <section className="part8-cases">
      <div className="cases-container">
        <div className="cases-section">
          <div className="cases-image-wrapper">
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
                className="cases-swiper"
              >
                {images.map((item, index) => {
                  const url = typeof item === 'string'
                    ? getFileUrl(item)
                    : item.url || getFileUrl(item.filename || item.name);
                  return (
                    <SwiperSlide key={index}>
                      <img src={url} alt={`cases-${index}`} className="cases-image" />
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            ) : (
              <div className="cases-image" />
            )}
          </div>
          <div className="cases-text">
            <h2 className="cases-title">
              {t('cases.title')}
            </h2>
            <p className="cases-desc">
              {t('cases.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Part8Cases;
