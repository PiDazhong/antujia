import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { useLang } from '../../../../context/LanguageContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.scss';

const QualityControl = () => {
  // QualityControl 模块文本：
  // [1] 白色大标题（Quality control）
  const sharkObj = useSharkText({ module: 'QualityContral' });
  // 共三张图，图下灰色描述各取自身 fileDesc 的当前语言字段
  // imgObj[1]：实验室主图（通栏大卡片）
  // imgObj[2]：检测设备长条图（整图，按原始比例展示）
  // imgObj[3]：认证 logo 白底图
  const imgObj = useImage({ module: 'QualityContral' });
  const { lang } = useLang();

  const toItem = (item) =>
    item?.fileUrl ? { src: FILE_BASE_URL + item.fileUrl, label: item?.fileDesc?.[lang] } : null;

  const mainItem = toItem(imgObj[1]); // 实验室主图
  const middleItem = toItem(imgObj[2]); // 检测设备长条图
  const certItem = toItem(imgObj[3]); // 认证 logo 白底图

  return (
    <section className="quality-control">
      <div className="quality-control__head">
        {sharkObj[1] && <h2 className="quality-control__title">{sharkObj[1]}</h2>}
      </div>

      {/* 主图：imgObj[1]，下方灰色描述取 fileDesc */}
      {mainItem && (
        <div className="quality-control__block">
          <div className="quality-control__main-card">
            <img className="quality-control__main-img" src={mainItem.src} alt={mainItem.label ?? ''} />
          </div>
          {mainItem.label && <p className="quality-control__label">{mainItem.label}</p>}
        </div>
      )}

      {/* 长条图：imgObj[2]，整图按原始比例展示；下方灰色描述取 fileDesc */}
      {middleItem && (
        <div className="quality-control__block">
          <div className="quality-control__middle-card">
            <img className="quality-control__middle-img" src={middleItem.src} alt={middleItem.label ?? ''} />
          </div>
          {middleItem.label && <p className="quality-control__label">{middleItem.label}</p>}
        </div>
      )}

      {/* 认证 logo：imgObj[3]，白底卡片；下方灰色描述取 fileDesc */}
      {certItem && (
        <div className="quality-control__block">
          <div className="quality-control__cert-card">
            <img className="quality-control__cert-img" src={certItem.src} alt={certItem.label ?? ''} />
          </div>
          {certItem.label && <p className="quality-control__label">{certItem.label}</p>}
        </div>
      )}
    </section>
  );
};

export default QualityControl;
