import useImage from '../../hooks/useImage';
import useCodeTable from '../../hooks/useCodeTable';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import { toAbsoluteUrl } from '../../../../utils/url';
import './index.scss';

// 右侧悬浮 CTA：固定在屏幕最右侧、垂直居中
// 展示 heroImage 模块 sort=2 的图片，点击行为与 HeroImage 的 WhatsApp 按钮一致
// 直接用 img 渲染（不包 button）：少一层盒子，浏览器按设备像素原样栅格化，避免缩放发糊
const FloatingCta = () => {
  const imgObj = useImage({ module: 'heroImage' });
  const codeTable = useCodeTable();
  const whatsappUrl = toAbsoluteUrl(codeTable?.whatsAppLink);

  const src = imgObj[2]?.fileUrl ? FILE_BASE_URL + imgObj[2].fileUrl : null;

  const handleCtaClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // 图片未配置时不渲染，避免空占位
  if (!src) return null;

  return (
    <img
      className="floating-cta"
      src={src}
      alt="WhatsApp"
      onClick={handleCtaClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCtaClick();
      }}
    />
  );
};

export default FloatingCta;
