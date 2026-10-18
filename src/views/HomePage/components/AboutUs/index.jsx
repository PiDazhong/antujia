import {
  ClockCircleFilled,
  EnvironmentFilled,
  PhoneFilled,
  MailFilled,
} from '@ant-design/icons';
import useSharkText from '../../hooks/useSharkText';
import './index.scss';

// 联系信息行图标：填充系（Filled）antd 原生图标，按行顺序依次为 营业时间/地址/电话/邮箱
const CONTACT_ICONS = [
  ClockCircleFilled,
  EnvironmentFilled,
  PhoneFilled,
  MailFilled,
];

const AboutUs = () => {
  // aboutus 模块文本：
  // [1] 标题（About us）[2] 第一段介绍文案 [3] 第二段愿景文案
  // [4]~[7] 联系信息列表：4 条整行文案，自上而下依次为
  // 营业时间 / 地址 / 电话 / 邮箱
  const sharkObj = useSharkText({ module: 'aboutus' });

  // 联系信息：sharkObj[4]~[7]
  const contacts = Array.from({ length: 4 }, (_, i) => sharkObj[4 + i]).filter(Boolean);

  return (
    <section className="about-us">
      <div className="about-us__inner">
        {sharkObj[1] && <h2 className="about-us__title">{sharkObj[1]}</h2>}

        {/* 介绍 + 愿景两段文案 */}
        {(sharkObj[2] || sharkObj[3]) && (
          <div className="about-us__intro">
            {sharkObj[2] && <p className="about-us__paragraph">{sharkObj[2]}</p>}
            {sharkObj[3] && <p className="about-us__paragraph">{sharkObj[3]}</p>}
          </div>
        )}

        {/* 联系信息列表：整行文案，行间细分隔线，图标为 antd 原生图标 */}
        {contacts.length > 0 && (
          <div className="about-us__contact">
            {contacts.map((text, index) => {
              const Icon = CONTACT_ICONS[index];
              return (
                <div className="about-us__contact-row" key={index}>
                  {Icon && <Icon className="about-us__contact-icon" aria-hidden="true" />}
                  <p className="about-us__contact-text">
                    <span className="about-us__contact-value">{text}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutUs;
