import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL } from '../../config/uploadModules';
import SocialLinks from '../SocialLinks';
import './index.less';

const Footer = () => {
  const { t } = useTranslation();
  const [contactMap, setContactMap] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/damonshome-server/codeTable/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: ['tel', 'mail'] }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.code === 1 && Array.isArray(data.data)) {
          const map = {};
          data.data.forEach((item) => {
            map[item.code] = item.value;
          });
          setContactMap(map);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="site-footer">
      {/* Main footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* About */}
            <div className="footer-block">
              <h5 className="footer-block-title">{t('aboutUs.title')}</h5>
              <div className="footer-block-content">
                <img src="/damons-white.png" alt="Damons" className="footer-logo-img" />
                <p className="footer-about-text">
                  {t('aboutUs.description')}
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="footer-block">
              <h5 className="footer-block-title">{t('contact.title')}</h5>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <PhoneOutlined className="footer-contact-icon" />
                  <span dir="ltr">{contactMap.tel}</span>
                </div>
                <div className="footer-contact-item">
                  <MailOutlined className="footer-contact-icon" />
                  <span>{contactMap.mail}</span>
                </div>
                <div className="footer-contact-item">
                  <EnvironmentOutlined className="footer-contact-icon" />
                  <span>{t('contact.address')}</span>
                </div>
              </div>
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-copyright">
        <div className="container">
          <p>{t('footer.rights')}</p>
          <Link to="/privacy" className="footer-privacy-link">{t('privacy.link')}</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
