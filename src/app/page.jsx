import { fetchHomeData } from '../lib/home-data';
import { HomeDataProvider } from '../views/HomePage/context/HomeDataContext';
import HomePage from '../views/HomePage';
import HomeChrome from './HomeChrome';

// SSR：服务端并行拉取全部首页模块数据（shark + image + 码表），
// 经 initialData 注入 HomeDataProvider，客户端不再发请求
export default async function Home() {
  const data = await fetchHomeData();

  return (
    <HomeDataProvider initialData={data}>
      <div className="app">
        <HomePage />
        <HomeChrome />
      </div>
    </HomeDataProvider>
  );
}
