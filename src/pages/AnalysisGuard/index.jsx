import { useState } from 'react';
import { Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import AnalysisPage from '../AnalysisPage';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/uploadModules';
import { getToken, setToken } from '../../utils/authFetch';
import './index.less';

const AnalysisGuard = () => {
  const [authenticated, setAuthenticated] = useState(() => !!getToken());
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!password.trim()) {
      message.warning('请输入密码');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.login}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();
      if (data && data.success === true && data.code === 1 && data.data?.token) {
        setToken(data.data.token);
        setAuthenticated(true);
        message.success('验证通过');
      } else {
        message.error(data.message || '密码错误');
      }
    } catch (err) {
      message.error(`校验失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (authenticated) {
    return <AnalysisPage />;
  }

  return (
    <div className="analysis-guard">
      <div className="guard-overlay">
        <div className="guard-card">
          <div className="guard-icon">
            <LockOutlined />
          </div>
          <h2 className="guard-title">数据监控面板</h2>
          <p className="guard-desc">请输入密码以继续访问</p>
          <Input.Password
            className="guard-input"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            prefix={<LockOutlined />}
            size="large"
          />
          <Button
            className="guard-btn"
            type="primary"
            size="large"
            block
            onClick={handleSubmit}
            loading={loading}
          >
            进入
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisGuard;
