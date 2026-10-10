import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.less';

const RiyadhManufacturing = () => {
  // riyadhmanufacturing 模块文本：
  // [1] 顶部居中小文案 [2] 白色大标题 [3] 大标题下方描述文案
  const sharkObj = useSharkText({ module: 'RiyadhManufacturingBase' });
  // imgObj[1]~[2]：工厂实拍图，纯图无文字标签
  const imgObj = useImage({ module: 'RiyadhManufacturingBase' });

  const items = Array.from({ length: 2 }, (_, i) => {
    const item = imgObj[i + 1];
    if (!item?.fileUrl) return null;
    return {
      src: FILE_BASE_URL + item.fileUrl,
    };
  }).filter(Boolean);

  return (
    <section className="riyadh-manufacturing">
      <div className="riyadh-manufacturing__head">
        <p className="riyadh-manufacturing__eyebrow">{sharkObj[1]}</p>
        <h2 className="riyadh-manufacturing__title">{sharkObj[2]}</h2>
        {sharkObj[3] && <p className="riyadh-manufacturing__desc">{sharkObj[3]}</p>}
      </div>

      {/* 2 列图片卡片，图片来源 sort=1~2，卡片比例 27:49 */}
      {items.length > 0 && (
        <div className="riyadh-manufacturing__collage">
          {items.map((item, index) => (
            <div className="riyadh-manufacturing__card" key={index}>
              <img className="riyadh-manufacturing__card-img" src={item.src} alt="" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default RiyadhManufacturing;
