'use client';

import useSharkText from '../HomePage/hooks/useSharkText';
import './index.scss';

// privacypolicy 模块文本（shark.json，与后台管理端对应），SSR 阶段已随页面预取：
// [1] 页面标题 [2] 引言
// [3]/[4] 信息收集 标题/正文 [5]/[6] 信息使用 [7]/[8] 信息共享
// [9]/[10] 数据安全 [11]/[12] 用户权利
// [13] 联系我们标题 [14] 联系我们正文 [15] 邮箱标签 [16] 电话标签 [17] 地址标签 [18] 地址内容
const PrivacyPage = () => {
  const sharkObj = useSharkText({ module: 'privacypolicy' });

  const sections = [
    { key: 'collection', title: sharkObj[3], text: sharkObj[4] },
    { key: 'usage', title: sharkObj[5], text: sharkObj[6] },
    { key: 'sharing', title: sharkObj[7], text: sharkObj[8] },
    { key: 'security', title: sharkObj[9], text: sharkObj[10] },
    { key: 'rights', title: sharkObj[11], text: sharkObj[12] },
  ];

  return (
    <div className="privacy-page">
      <div className="privacy-hero">
        <div className="container">
          <h1 className="privacy-title">{sharkObj[1]}</h1>
        </div>
      </div>
      <div className="container">
        <div className="privacy-content">
          <p className="privacy-intro">{sharkObj[2]}</p>
          {sections.map((section) => (
            <section key={section.key} className="privacy-section">
              <h2 className="privacy-section-title">{section.title}</h2>
              <div className="privacy-section-text">{section.text}</div>
            </section>
          ))}
          <section className="privacy-section">
            <h2 className="privacy-section-title">{sharkObj[13]}</h2>
            <div className="privacy-section-text">
              <p>{sharkObj[14]}</p>
              <div className="privacy-contact-list">
                <div className="privacy-contact-item">
                  <span className="privacy-contact-label">{sharkObj[15]}</span>
                  <span>{sharkObj[16]}</span>
                </div>
                <div className="privacy-contact-item">
                  <span className="privacy-contact-label">{sharkObj[17]}</span>
                  <span>{sharkObj[18]}</span>
                </div>
                <div className="privacy-contact-item">
                  <span className="privacy-contact-label">{sharkObj[19]}</span>
                  <span>{sharkObj[20]}</span>
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
