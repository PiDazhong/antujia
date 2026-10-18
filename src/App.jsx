import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { UpOutlined } from '@ant-design/icons';
import { ConfigProvider } from 'antd';
import Header from './pages/HomePage/components/Header';
import HomePage from './pages/HomePage';
import AuthGuard from './pages/AuthGuard';
import PrivacyPage from './pages/PrivacyPage';
import { useLang } from './context/LanguageContext';
import { HomeDataProvider } from './pages/HomePage/context/HomeDataContext';
import { writeLog } from './utils/log';
import './App.scss';

function App() {
  const { lang } = useLang();
  const location = useLocation();

  useEffect(() => {
    const img = new Image();
    img.src = 'https://saudi.damons.sa/icons/home/ç­å°2.1.jpg';
  }, []);

  useEffect(() => {
    const excluded = ['/manage'];
    if (!excluded.includes(location.pathname)) {
      writeLog('view');
    }
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ConfigProvider direction={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* 数据 Provider 全局挂载（模块懒加载）：隐私页等复用 Header 时也能拿到 context，
          且只请求实际用到的模块，不会拉全量 */}
      <HomeDataProvider>
        <Routes>
          <Route
            path="/"
            element={
              <div className="app">
                <HomePage />
                {/* <Header />
              <main>
                
              </main>
              <Footer />
              
              <LetsChat />
              <button
                className="back-to-top"
                onClick={scrollToTop}
                aria-label="Back to top"
              >
                <UpOutlined />
              </button> */}
              </div>
            }
          />
          <Route
            path="/manage"
            element={
              <ConfigProvider direction="ltr">
                <AuthGuard />
              </ConfigProvider>
            }
          />
          <Route
            path="/privacy"
            element={
              <div className="app">
                <Header />
                <main>
                  <PrivacyPage />
                </main>
              </div>
            }
          />
        </Routes>
      </HomeDataProvider>
    </ConfigProvider>
  );
}

export default App;
