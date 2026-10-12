import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import './index.less';

const RiyadhManufacturing = () => {
  // riyadhmanufacturing 模块文本：
  // [1] 顶部居中小文案 [2] 白色大标题 [3] 大标题下方描述文案
  const sharkObj = useSharkText({ module: 'RiyadhManufacturingBase' });
  // imgObj[1]：整幅排版图片（原 2 张工厂实拍合并为 1 张），按原始比例完整展示
  const imgObj = useImage({ module: 'RiyadhManufacturingBase' });

  const collageSrc = imgObj[1]?.fileUrl ? FILE_BASE_URL + imgObj[1].fileUrl : null;

  return (
    <section className="riyadh-manufacturing">
      <div className="riyadh-manufacturing__head">
        <p className="riyadh-manufacturing__eyebrow">{sharkObj[1]}</p>
        <h2 className="riyadh-manufacturing__title">{sharkObj[2]}</h2>
        {sharkObj[3] && <p className="riyadh-manufacturing__desc">{sharkObj[3]}</p>}
      </div>

      {/* 整幅图片（sort=1），全宽按原始比例展示，不裁切 */}
      {collageSrc && (
        <div className="riyadh-manufacturing__collage">
          <img className="riyadh-manufacturing__collage-img" src={collageSrc} alt="" />
        </div>
      )}
    </section>
  );
};

export default RiyadhManufacturing;
