import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { useLang } from '../../../../context/LanguageContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import CookieBanner from '../CookieBanner';
import './index.less';

// 语言循环顺序：点击胶囊按钮切换到下一个语言
const LANG_ORDER = ['en', 'ar'];
// 接口数据未加载完成前的兜底文案
const FALLBACK_LABELS = { zh: '中文', en: 'EN', ar: 'AR' };

const Header = () => {
  const { lang, setLang } = useLang();
  // header 模块文本：sharkObj[1] = 字标下标语，sharkObj[2] = 语言按钮文案
  const sharkObj = useSharkText({ module: 'header' });
  // imgObj[1] = 品牌图标（2x2 圆点），imgObj[2] = 品牌字标（damons home）
  const imgObj = useImage({ module: 'header' });
  const brandImg = imgObj[1]?.fileUrl ? FILE_BASE_URL + imgObj[1].fileUrl : null;
  const nameImg = imgObj[2]?.fileUrl ? FILE_BASE_URL + imgObj[2].fileUrl : null;

  const toggleLang = () => {
    const next = LANG_ORDER[(LANG_ORDER.indexOf(lang) + 1) % LANG_ORDER.length];
    setLang(next);
  };

  return (
    <>
      <header className="home-header">
        {/* 左侧：品牌图标 + 品牌字标（优先取接口图片，未配置时用本地兜底） */}
        <div className="home-header__brand">
          <img className="home-header__brand-img" src={brandImg} alt="" />
          <span className="home-header__wordmark">
            <img className="home-header__name-img" src={nameImg} alt="" />
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

      {/* Cookie 同意条：fixed 定位，挂在 Header 下跟随首页展示 */}
      <CookieBanner />
    </>
  );
};

export default Header;
