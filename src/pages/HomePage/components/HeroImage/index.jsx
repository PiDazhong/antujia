import { PhoneOutlined } from '@ant-design/icons';
import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.less';

// 把数字值拆成「数字+符号」和「字母」两类片段：
// "15+" → ["15+"]；"2BILLION+" → ["2", "BILLION", "+"]（字母部分渲染为小号字）
const splitValue = (value = '') => value.match(/[A-Za-z]+|[^A-Za-z]+/g) ?? [];

const HeroImage = () => {
  // heroImage 模块文本：
  // [1] 主标题第一行 [2] 主标题第二行 [3] 按钮文案
  // [4]/[5] [6]/[7] [8]/[9] [10]/[11] 底部四项统计的数字和标签
  const sharkObj = useSharkText({ module: 'heroImage' });
  // imgObj[1]：sort=1 的整版背景图
  const imgObj = useImage({ module: 'heroImage' });
  const bgSrc = imgObj[1]?.fileUrl ? FILE_BASE_URL + imgObj[1].fileUrl : null;

  const stats = [
    { value: sharkObj[4], label: sharkObj[5] },
    { value: sharkObj[6], label: sharkObj[7] },
    { value: sharkObj[8], label: sharkObj[9] },
    { value: sharkObj[10], label: sharkObj[11] },
  ];

  return (
    <section className="hero-image">
      {/* 整版背景图（sort=1） */}
      {bgSrc && (
        <img className="hero-image__bg" src={bgSrc} alt="" aria-hidden="true" />
      )}

      {/* 顶部主标题 */}
      <h1 className="hero-image__title">
        <span className="hero-image__title-line hero-image__title-line--white">
          {sharkObj[1]}
        </span>
        <span className="hero-image__title-line hero-image__title-line--gold">
          {sharkObj[2]}
        </span>
      </h1>

      {/* WhatsApp 长条按钮 */}
      <button type="button" className="hero-image__cta">
        <PhoneOutlined className="hero-image__cta-icon" />
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
