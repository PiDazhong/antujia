import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/uploadModules';
import './index.less';

const Part3Services = () => {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.list()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: 'services' }),
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
    return `${API_BASE_URL}/icons/services/${filename}`;
  };

  const services = [
    {
      id: 1,
      icon: images[0]
        ? (typeof images[0] === 'string' ? getFileUrl(images[0]) : images[0].url || getFileUrl(images[0].filename || images[0].name))
        : 'https://workspace.ae/img/cms/Home/Project-icon-.png',
      title: t('service1.title'),
      description: t('service1.description'),
    },
    {
      id: 2,
      icon: images[1]
        ? (typeof images[1] === 'string' ? getFileUrl(images[1]) : images[1].url || getFileUrl(images[1].filename || images[1].name))
        : 'https://workspace.ae/img/cms/Home/Space-icon-.png',
      title: t('service2.title'),
      description: t('service2.description'),
    },
    {
      id: 3,
      icon: images[2]
        ? (typeof images[2] === 'string' ? getFileUrl(images[2]) : images[2].url || getFileUrl(images[2].filename || images[2].name))
        : 'https://workspace.ae/img/cms/Home/Color-icon-.png',
      title: t('service3.title'),
      description: t('service3.description'),
    },
  ];

  return (
    <section className="part3-services">
      <div className="services-container">
        <h2 className="services-section-title">{t('services.title')}</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-item">
              <div className="service-icon-wrapper">
                <img src={service.icon} alt={service.title} className="service-icon" />
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Part3Services;
