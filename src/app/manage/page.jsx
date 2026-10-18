import { ConfigProvider } from 'antd';
import AuthGuard from '../../views/AuthGuard';

// 后台管理页：登录态在客户端 localStorage，强制动态渲染不预生成
export const dynamic = 'force-dynamic';

export default function Manage() {
  return (
    <ConfigProvider direction="ltr">
      <AuthGuard />
    </ConfigProvider>
  );
}
