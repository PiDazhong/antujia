import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { useLang } from '../../../../context/LanguageContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.scss';

const Green = () => {
  // Green 模块文本：
  // [1] 顶部居中小文案（金） [2] 白色大标题 [3] 暂不渲染
  // [4]~[13] 认证卖点列表：5 组「标题 + 描述」，标题金色靠左、描述白色
  const sharkObj = useSharkText({ module: 'green' });
  // imgObj[1]：森林大图，通栏铺满；fileDesc 取当前语言字段作为图片左下角叠放描述
  // imgObj[2]~[3]：认证证书图，2 列圆角卡片
  const imgObj = useImage({ module: 'green' });
  const { lang } = useLang();

  const cover = imgObj[1]?.fileUrl ? FILE_BASE_URL + imgObj[1].fileUrl : null;
  const coverDesc = imgObj[1]?.fileDesc?.[lang];

  // 认证证书：imgObj[2]~[3]
  const certs = Array.from({ length: 2 }, (_, i) => {
    const item = imgObj[i + 2];
    if (!item?.fileUrl) return null;
    return { src: FILE_BASE_URL + item.fileUrl, desc: item?.fileDesc?.[lang] };
  }).filter(Boolean);

  // 认证卖点：sharkObj[4]~[13] 两两一组（标题、描述）
  const features = Array.from({ length: 5 }, (_, i) => {
    const title = sharkObj[4 + i * 2];
    const desc = sharkObj[5 + i * 2];
    if (!title && !desc) return null;
    return { title, desc };
  }).filter(Boolean);

  return (
    <section className="green-el">
      <div className="green-el__head">
        {sharkObj[1] && <p className="green-el__eyebrow">{sharkObj[1]}</p>}
        {sharkObj[2] && <h2 className="green-el__title">{sharkObj[2]}</h2>}
      </div>

      {/* 通栏大图：底部黑色渐变上叠放左下角白色描述文案 */}
      {cover && (
        <div className="green-el__media">
          <img className="green-el__media-img" src={cover} alt={coverDesc ?? ''} />
          <div className="green-el__media-mask" />
          {coverDesc && <p className="green-el__media-desc">{coverDesc}</p>}
        </div>
      )}

      {/* 认证卖点列表：sharkObj[4]~[13]，5 组标题 + 描述 */}
      {features.length > 0 && (
        <div className="green-el__features">
          {features.map((feature, index) => (
            <div className="green-el__feature" key={index}>
              {feature.title && <h3 className="green-el__feature-title">{feature.title}</h3>}
              {feature.desc && <p className="green-el__feature-desc">{feature.desc}</p>}
            </div>
          ))}
        </div>
      )}

      {/* 认证证书图：imgObj[2]~[3]，2 列圆角卡片 */}
      {certs.length > 0 && (
        <div className="green-el__certs">
          {certs.map((cert, index) => (
            <img className="green-el__cert-img" key={index} src={cert.src} alt={cert.desc ?? ''} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Green;
