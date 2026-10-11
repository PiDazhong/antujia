import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { useHomeData } from '../../context/HomeDataContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import { toAbsoluteUrl } from '../../../../utils/url';
import './index.less';

// 把数字值拆成「数字+符号」和「字母单位」两类片段：
// "15+" → ["15+"]；"2BILLION+" → ["2", "BILLION", "+"]（字母部分渲染为小号字）
// 字母范围含阿语（؀-ۿ），否则 "2مليار+" 拆不出来，单位吃不到小号字样式
const splitValue = (value = '') =>
  value.match(/[A-Za-z\u0600-\u06FF]+|[^A-Za-z\u0600-\u06FF]+/g) ?? [];

const HeroImage = () => {
  // heroImage 模块文本：
  // [1] 主标题第一行 [2] 主标题第二行 [3] 按钮文案
  // [4]/[5] [6]/[7] [8]/[9] [10]/[11] 底部四项统计的数字和标签
  const sharkObj = useSharkText({ module: 'heroImage' });
  // heroImage 模块图片：
  // [1] 整版背景图（sort=1） [2] CTA 按钮电话图标（sort=2）
  const imgObj = useImage({ module: 'heroImage' });
  const bgSrc = imgObj[1]?.fileUrl ? FILE_BASE_URL + imgObj[1].fileUrl : null;
  const ctaIconSrc = imgObj[2]?.fileUrl ? FILE_BASE_URL + imgObj[2].fileUrl : null;

  // 全量码表里的 whatsapp 跳转链接（HomeDataContext 统一拉取）
  const { codeTable } = useHomeData();
  const whatsappUrl = toAbsoluteUrl(codeTable?.whatsAppLink);

  const handleCtaClick = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const stats = [
    { value: sharkObj[4], label: sharkObj[5] },
    { value: sharkObj[6], label: sharkObj[7] },
    { value: sharkObj[8], label: sharkObj[9] },
    { value: sharkObj[10], label: sharkObj[11] },
  ];

  return (
    <section className="hero-image">
      {/* 整版背景图（sort=1） */}
      {bgSrc && <img className="hero-image__bg" src={bgSrc} alt="" aria-hidden="true" />}

      {/* 顶部主标题 */}
      <h1 className="hero-image__title">
        <span className="hero-image__title-line hero-image__title-line--white">{sharkObj[1]}</span>
        <span className="hero-image__title-line hero-image__title-line--gold">{sharkObj[2]}</span>
      </h1>

      {/* WhatsApp 长条按钮（浅金半透明底）：点击新窗口打开码表配置的 whatsapp 链接 */}
      <button
        type="button"
        className="hero-image__cta"
        onClick={handleCtaClick}
        disabled={!whatsappUrl}
      >
        {ctaIconSrc && (
          <img className="hero-image__cta-icon" src={ctaIconSrc} alt="" aria-hidden="true" />
        )}
        <span>{sharkObj[3]}</span>
      </button>

      {/* 底部统计：2x2，数字 + 标签各为独立 sharkKey */}
      <div className="hero-image__stats">
        {stats.map(
          (item, index) =>
            item.value && (
              <div className="hero-image__stat" key={index}>
                <span className="hero-image__stat-value">
                  {splitValue(item.value).map((part, i) =>
                    /[A-Za-z]/.test(part) ? (
                      <span className="hero-image__stat-unit" key={i}>
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}
                </span>
                <span className="hero-image__stat-label">{item.label}</span>
              </div>
            )
        )}
      </div>
    </section>
  );
};

export default HeroImage;
