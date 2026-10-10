import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { useLang } from '../../../../context/LanguageContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.less';

const OurItalyDesign = () => {
  // ouritalydesign 模块文本：
  // [1] 顶部居中小文案（金） [2] 白色大标题 [3] 大标题下方描述文案（同 riyadhManufacturing 的 __desc）
  const sharkObj = useSharkText({ module: 'OurItaliandesignteam' });
  // imgObj[1]~[3]：团队相关图片，文字取 fileDesc 的当前语言字段
  const imgObj = useImage({ module: 'OurItaliandesignteam' });
  const { lang } = useLang();

  const items = Array.from({ length: 3 }, (_, i) => {
    const item = imgObj[i + 1];
    if (!item?.fileUrl) return null;
    return {
      src: FILE_BASE_URL + item.fileUrl,
      label: item?.fileDesc?.[lang],
    };
  }).filter(Boolean);

  return (
    <section className="our-italy-design">
      <div className="our-italy-design__head">
        <p className="our-italy-design__eyebrow">{sharkObj[1]}</p>
        <h2 className="our-italy-design__title">{sharkObj[2]}</h2>
        {sharkObj[3] && <p className="our-italy-design__desc">{sharkObj[3]}</p>}
      </div>

      {/* 单列 grid，图片来源 sort=1~3，图下白色描述取 fileDesc */}
      {items.length > 0 && (
        <div className="our-italy-design__photos">
          {items.map((item, index) => (
            <div className="our-italy-design__photo-item" key={index}>
              <div className="our-italy-design__photo-card">
                <img className="our-italy-design__photo-img" src={item.src} alt={item.label ?? ''} />
              </div>
              {item.label && <p className="our-italy-design__photo-label">{item.label}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OurItalyDesign;
