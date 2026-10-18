import { useState } from 'react';
import {
  FacebookFilled,
  InstagramFilled,
  GoogleCircleFilled,
  CaretDownFilled,
} from '@ant-design/icons';
import useCodeTable from '../../hooks/useCodeTable';
import { toAbsoluteUrl } from '../../../../utils/url';
import './index.scss';

// antd 图标库没有 TikTok，这里内联官方 logo 路径，样式与 antd 的 Filled 系列对齐
const TikTokIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

// 左侧悬浮社交栏：固定在屏幕最左侧、垂直居中，竖排
// 4 个社交图标 + 底部展开/收起按钮；链接统一从码表取，跳转逻辑与 HeroImage 的 CTA 一致
const SocialSidebar = () => {
  const [open, setOpen] = useState(true);
  const codeTable = useCodeTable();

  // 码表 code 约定与 whatsAppLink 同风格：facebookLink / instagramLink / tikTokLink / googleLink
  const socials = [
    { key: 'facebook', icon: <FacebookFilled />, url: toAbsoluteUrl(codeTable?.facebookLink) },
    { key: 'instagram', icon: <InstagramFilled />, url: toAbsoluteUrl(codeTable?.instagramLink) },
    { key: 'tiktok', icon: <TikTokIcon />, url: toAbsoluteUrl(codeTable?.tikTokLink) },
    { key: 'google', icon: <GoogleCircleFilled />, url: toAbsoluteUrl(codeTable?.googleLink) },
  ];

  const handleClick = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`social-sidebar${open ? ' is-open' : ''}`}>
      {/* 展开列表：grid 0fr→1fr 做高度动画（被折叠的必须是唯一子节点），单项再带透明度和位移动画，依次错峰出现 */}
      <div className="social-sidebar__list">
        <div className="social-sidebar__inner">
          {socials.map(({ key, icon, url }) => (
            <button
              key={key}
              type="button"
              className="social-sidebar__item"
              onClick={() => handleClick(url)}
              disabled={!url}
              aria-label={key}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* 展开/收起按钮：展开时箭头朝下（可收起），收起时箭头朝上（提示还有内容） */}
      <button
        type="button"
        className="social-sidebar__toggle"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'collapse' : 'expand'}
        aria-expanded={open}
      >
        <CaretDownFilled className="social-sidebar__toggle-icon" />
      </button>
    </div>
  );
};

export default SocialSidebar;
