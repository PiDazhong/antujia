import { fetchHomeData } from '../lib/home-data';
import { HomeDataProvider } from '../views/HomePage/context/HomeDataContext';
import HomePage from '../views/HomePage';
import { FILE_BASE_URL } from '../config/uploadModules';

// SSR：服务端并行拉取全部首页模块数据（shark + image + 码表），
// 经 initialData 注入 HomeDataProvider，客户端不再发请求
export default async function Home() {
  const data = await fetchHomeData();

  // 首屏背景图（heroImage 模块 sort=1）：在服务端算好真实地址，
  // 以 <link rel="preload"> 下发 —— React 19 会把它提升到 <head>，
  // 浏览器解析 HTML 时即开始下载，不必等 <img> 被发现，也不必等 JS hydration
  const heroImage = Object.values(data.modules.heroImage?.image ?? {}).find(
    (item) => item?.sort === 1
  );
  const heroSrc = heroImage?.fileUrl ? FILE_BASE_URL + heroImage.fileUrl : null;

  return (
    <>
      {heroSrc && (
        <link rel="preload" as="image" href={heroSrc} fetchPriority="high" />
      )}
      <HomeDataProvider initialData={data}>
        <div className="app">
          <HomePage />
        </div>
      </HomeDataProvider>
    </>
  );
}
