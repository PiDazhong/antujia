import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { useLang } from '../../../../context/LanguageContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.scss';

const FullHomeSolutions = () => {
  // fullHomeSolutions 模块文本：
  // [1] 顶部居中小文案 [2] 黑色大标题
  const sharkObj = useSharkText({ module: 'fullhomesolutions' });
  // imgObj[1]~[4]：四张项目案例图，文字取 fileDesc 的当前语言字段
  const imgObj = useImage({ module: 'fullhomesolutions' });
  const { lang } = useLang();

  const items = Array.from({ length: 12 }, (_, i) => {
    const item = imgObj[i + 1];
    if (!item?.fileUrl) return null;
    return {
      src: FILE_BASE_URL + item.fileUrl,
      label: item?.fileDesc?.[lang],
    };
  }).filter(Boolean);

  return (
    <section className="full-home-solutions">
      <div className="full-home-solutions__head">
        <p className="full-home-solutions__eyebrow">{sharkObj[1]}</p>
        <h2 className="full-home-solutions__title">{sharkObj[2]}</h2>
      </div>

      {/* 2 列图片卡片，图片来源 sort=1~4 */}
      {items.length > 0 && (
        <div className="full-home-solutions__grid">
          {items.map((item, index) => (
            <div className="full-home-solutions__card" key={index}>
              <img
                className="full-home-solutions__card-img"
                src={item.src}
                alt={item.label ?? ''}
              />
              <span className="full-home-solutions__card-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FullHomeSolutions;
