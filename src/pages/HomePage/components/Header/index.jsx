import useSharkText from '../../hooks/useSharkText';
import { useLang } from '../../../../context/LanguageContext';
import './index.less';

// 语言循环顺序：点击胶囊按钮切换到下一个语言
const LANG_ORDER = ['zh', 'en', 'ar'];
// 接口数据未加载完成前的兜底文案
const FALLBACK_LABELS = { zh: '中文', en: 'EN', ar: 'AR' };

const Header = () => {
  const { lang, setLang } = useLang();
  // header 模块文本：sharkObj[1] = 字标下标语，sharkObj[2] = 语言按钮文案
  const sharkObj = useSharkText({ module: 'header' });

  const toggleLang = () => {
    const next = LANG_ORDER[(LANG_ORDER.indexOf(lang) + 1) % LANG_ORDER.length];
    setLang(next);
  };

  return (
    <header className="home-header">
      {/* 左侧：2x2 圆点图标 + damons home 字标 */}
      <div className="home-header__brand">
        <span className="home-header__dots" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="home-header__wordmark">
          <span className="home-header__name">damons home</span>
          {sharkObj[1] && <span className="home-header__slogan">{sharkObj[1]}</span>}
        </span>
      </div>

      {/* 右侧：语言切换胶囊 + 汉堡菜单 */}
      <div className="home-header__actions">
        <button type="button" className="home-header__lang" onClick={toggleLang}>
          {sharkObj[2] || FALLBACK_LABELS[lang] || lang.toUpperCase()}
        </button>
        <button type="button" className="home-header__menu" aria-label="Menu">
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

export default Header;
