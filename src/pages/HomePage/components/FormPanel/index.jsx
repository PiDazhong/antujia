import { useState } from 'react';
import { message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import useSharkText from '../../hooks/useSharkText';
import useImage from '../../hooks/useImage';
import useCodeTable from '../../hooks/useCodeTable';
import { useLang } from '../../../../context/LanguageContext';
import { FILE_BASE_URL } from '../../../../config/uploadModules';
import { writeLog, sendMail } from '../../../../utils/log';
import './index.less';

// 提交限流：同一浏览器 10 秒内只允许提交一次
const RATE_LIMIT_KEY = 'contact_form_last_submit';
const COOLDOWN_MS = 10000;

const getRemainingCooldown = () => {
  const last = localStorage.getItem(RATE_LIMIT_KEY);
  if (!last) return 0;
  const elapsed = Date.now() - parseInt(last, 10);
  return Math.max(0, COOLDOWN_MS - elapsed);
};

// 去掉输入里的 HTML 标签，防注入
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '');
};

const SPAM_KEYWORDS = ['test', 'spam', 'xxx', 'http', 'https', 'www.'];

const FormPanel = () => {
  // formpanel 模块文本（表单各字段标签，按 sharkKey 顺序）：
  // [1] Your name     [2] Phone Number  [3] Your Email
  // [4] Your Company  [5] Subject       [6] Your Question
  // [7] 提交按钮      [8] 提交成功提示   [9] 提交失败提示  [10] 提交限流提示
  const sharkObj = useSharkText({ module: 'formpanel' });
  // formpanel 模块图片：三张图标（卡车/金币/奖章），标题取 fileDesc，副标题取 fileSubDesc（均为多语言字段）
  const imgObj = useImage({ module: 'formpanel' });
  const codeTable = useCodeTable(); // codeTable.receiveEmail：询盘收件邮箱
  const { lang } = useLang();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    subject: '',
    question: '',
    website: '', // 蜜罐字段：正常用户不可见，被机器人填写时直接放弃提交
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let sanitizedValues = form;
    try {
      const remaining = getRemainingCooldown();
      if (remaining > 0) {
        const seconds = Math.ceil(remaining / 1000);
        message.warning((sharkObj[10] ?? '').replace('{{seconds}}', seconds));
        return;
      }

      // 蜜罐字段有值说明是机器人，静默放弃
      if (form.website) {
        return;
      }

      sanitizedValues = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === 'string' ? sanitizeString(v) : v])
      );

      const hasSpam = Object.values(sanitizedValues).some(
        (v) => typeof v === 'string' && SPAM_KEYWORDS.some((kw) => v.toLowerCase().includes(kw))
      );

      // 接口字段（saudi-server/emailRoute）：name/company/phone/email/message/to
      // 服务端无独立 subject 字段，合并进 message；to 取码表 receiveEmail（缺省走服务端默认收件人）
      const mailPayload = {
        name: sanitizedValues.name,
        company: sanitizedValues.company,
        phone: sanitizedValues.phone,
        email: sanitizedValues.email,
        message: sanitizedValues.subject
          ? `Subject: ${sanitizedValues.subject}\n${sanitizedValues.question}`
          : sanitizedValues.question,
        to: codeTable.receiveEmail,
      };

      // 命中垃圾关键词时不真正发信，但对外表现与成功一致（不暴露校验细节）
      if (!hasSpam) {
        await sendMail(mailPayload);
      }

      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      message.success(sharkObj[8], 6);
      // 埋点：当前项目 logRoute 约定 action 必须为 'submit' 且表单字段平铺，服务端才落 name/company/phone/email/message
      writeLog('submit', mailPayload);
      setForm({
        name: '',
        phone: '',
        email: '',
        company: '',
        subject: '',
        question: '',
        website: '',
      });
    } catch (err) {
      message.error(sharkObj[9] ?? '');
      // 埋点：失败原因记录到 action（服务端固定落 timestamp/ip/device，错误文本由 message 字段带过）
      writeLog('submit_error', {
        error: err?.message || String(err),
        message: `submit failed: ${err?.message || String(err)}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // 表单下方三张特性图（imgObj[1]~[3]）：图标 + 标题(fileDesc) + 副标题(fileSubDesc)，均按当前语言取值
  const featureItems = [1, 2, 3]
    .map((sort) => {
      const item = imgObj[sort];
      if (!item?.fileUrl) return null;
      return {
        src: FILE_BASE_URL + item.fileUrl,
        title: item?.fileDesc?.[lang],
        subTitle: item?.fileSubDesc?.[lang],
      };
    })
    .filter(Boolean);

  return (
    <section className="form-panel">
      <div className="form-panel__form">
        {/* 字段标签均取后台 sharkObj，提交字段与 form state 一一对应 */}
        <label className="form-panel__field">
          <span className="form-panel__label">{sharkObj[1]}</span>
          <input
            className="form-panel__input"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
          />
        </label>

        <label className="form-panel__field">
          <span className="form-panel__label">{sharkObj[2]}</span>
          <input
            className="form-panel__input"
            type="tel"
            value={form.phone}
            onChange={handleChange('phone')}
          />
        </label>

        <label className="form-panel__field">
          <span className="form-panel__label">{sharkObj[3]}</span>
          <input
            className="form-panel__input"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
          />
        </label>

        <label className="form-panel__field">
          <span className="form-panel__label">{sharkObj[4]}</span>
          <input
            className="form-panel__input"
            type="text"
            value={form.company}
            onChange={handleChange('company')}
          />
        </label>

        <label className="form-panel__field">
          <span className="form-panel__label">{sharkObj[5]}</span>
          <input
            className="form-panel__input"
            type="text"
            value={form.subject}
            onChange={handleChange('subject')}
          />
        </label>

        <label className="form-panel__field">
          <span className="form-panel__label">{sharkObj[6]}</span>
          <textarea
            className="form-panel__input form-panel__input--textarea"
            rows={3}
            value={form.question}
            onChange={handleChange('question')}
          />
        </label>

        {/* 蜜罐字段：视觉隐藏，仅供机器人填写 */}
        <label className="form-panel__honeypot">
          <span>Website</span>
          <input
            type="text"
            autoComplete="off"
            tabIndex={-1}
            value={form.website}
            onChange={handleChange('website')}
          />
        </label>

        <button
          className="form-panel__submit"
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
        >
          {submitting && <LoadingOutlined className="form-panel__submit-icon" />}
          {sharkObj[7]}
        </button>
      </div>

      {/* 特性列表：imgObj[1]~[3]，图标在左、标题/副标题在右，纵向堆叠 */}
      {featureItems.length > 0 && (
        <div className="form-panel__features">
          {featureItems.map((item, index) => (
            <div className="form-panel__feature" key={index}>
              <img className="form-panel__feature-icon" src={item.src} alt={item.title ?? ''} />
              <div className="form-panel__feature-texts">
                {item.title && <p className="form-panel__feature-title">{item.title}</p>}
                {item.subTitle && <p className="form-panel__feature-sub">{item.subTitle}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FormPanel;
