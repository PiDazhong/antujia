import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { useLang } from '../../../../context/LanguageContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.less';

const WhatCanIDoForYou = () => {
  // whatCanIDoForYou 模块文本：
  // [1] 顶部居中小文案 [2] 黑色大标题
  const sharkObj = useSharkText({ module: 'whatcanidoforyou' });
  // imgObj[1]~[6]：六张产品图，文字取 fileDesc 的当前语言字段
  const imgObj = useImage({ module: 'whatcanidoforyou' });
  const { lang } = useLang();

  const items = Array.from({ length: 6 }, (_, i) => {
    const item = imgObj[i + 1];
    if (!item?.fileUrl) return null;
    return {
      src: FILE_BASE_URL + item.fileUrl,
      label: item?.fileDesc?.[lang],
    };
  }).filter(Boolean);

  return (
    <section className="what-can-i-do">
      <div className="what-can-i-do__head">
        <p className="what-can-i-do__eyebrow">{sharkObj[1]}</p>
        <h2 className="what-can-i-do__title">{sharkObj[2]}</h2>
      </div>

      {/* 2 列图片卡片，图片来源 sort=1~6 */}
      {items.length > 0 && (
        <div className="what-can-i-do__grid">
          {items.map((item, index) => (
            <div className="what-can-i-do__card" key={index}>
              <img className="what-can-i-do__card-img" src={item.src} alt={item.label ?? ''} />
              <span className="what-can-i-do__card-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default WhatCanIDoForYou;
