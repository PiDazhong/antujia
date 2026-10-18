import { fetchModuleData } from '../../lib/home-data';
import { HomeDataProvider } from '../../views/HomePage/context/HomeDataContext';
import Header from '../../views/HomePage/components/Header';
import PrivacyPage from '../../views/PrivacyPage';

// 隐私页只复用 Header + 隐私政策正文，SSR 只预取这两个模块（保持"用到哪个拉哪个"的原则）
export default async function Privacy() {
  const [header, privacypolicy] = await Promise.all([
    fetchModuleData('header'),
    fetchModuleData('privacypolicy'),
  ]);

  return (
    <HomeDataProvider initialData={{ modules: { header, privacypolicy } }}>
      <div className="app">
        <Header />
        <main>
          <PrivacyPage />
        </main>
      </div>
    </HomeDataProvider>
  );
}
