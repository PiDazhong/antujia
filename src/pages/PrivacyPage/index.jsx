import { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { API_BASE_URL } from '../../config/uploadModules';
import './index.less';

const PrivacyPage = () => {
  const { t } = useTranslation();
  const [contactMap, setContactMap] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/antujia-server/codeTable/query`, {
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

  const sections = [
    { key: 'collection', title: t('privacy.collection.title'), text: t('privacy.collection.text') },
    { key: 'usage', title: t('privacy.usage.title'), text: t('privacy.usage.text') },
    { key: 'sharing', title: t('privacy.sharing.title'), text: t('privacy.sharing.text') },
    { key: 'security', title: t('privacy.security.title'), text: t('privacy.security.text') },
    { key: 'rights', title: t('privacy.rights.title'), text: t('privacy.rights.text') },
  ];

  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <div className="container">
          <h1 className="privacy-title">{t('privacy.title')}</h1>
        </div>
      </div>
      <div className="container">
        <div className="privacy-content">
          <p className="privacy-intro">{t('privacy.intro')}</p>
          {sections.map((section) => (
            <section key={section.key} className="privacy-section">
              <h2 className="privacy-section-title">{section.title}</h2>
              <div className="privacy-section-text">{section.text}</div>
            </section>
          ))}
          <section className="privacy-section">
            <h2 className="privacy-section-title">{t('privacy.contact.title')}</h2>
            <div className="privacy-section-text">
              <p>{t('privacy.contact.text')}</p>
              <div className="privacy-contact-list">
                <div className="privacy-contact-item">
                  <span className="privacy-contact-label">{t('privacy.contact.emailLabel')}</span>
                  <span>{contactMap.mail}</span>
                </div>
                <div className="privacy-contact-item">
                  <span className="privacy-contact-label">{t('privacy.contact.phoneLabel')}</span>
                  <span dir="ltr">{contactMap.tel}</span>
                </div>
                <div className="privacy-contact-item">
                  <span className="privacy-contact-label">{t('privacy.contact.addressLabel')}</span>
                  <span>{t('contact.address')}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
