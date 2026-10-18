import useSharkText from '../../hooks/useSharkText';
import './index.scss';

const OurCapabilities = () => {
  // ourcapabilities 模块文本：
  // [1] 顶部居中小文案 [2] 金色大标题 [3]~[7] 能力条目（米白胶囊条，可多行）
  const sharkObj = useSharkText({ module: 'ourcapabilities' });

  const items = Array.from({ length: 6 }, (_, i) => sharkObj[i + 2]).filter(Boolean);

  return (
    <section className="our-capabilities">
      <div className="our-capabilities__head">
        <p className="our-capabilities__eyebrow">{sharkObj[1]}</p>
      </div>

      {/* 纵向排列的米白胶囊条，文案取 sharkKey=3~7，条数随后台文案动态收缩 */}
      {items.length > 0 && (
        <div className="our-capabilities__list">
          {items.map((text, index) => (
            <div className="our-capabilities__item" key={index}>
              <svg
                className="our-capabilities__item-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="our-capabilities__item-text">{text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default OurCapabilities;
