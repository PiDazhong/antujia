import Header from './components/Header';
import HeroImage from './components/HeroImage';
import WhatCanIDoForYou from './components/WhatCanIDoForYou';
import FullHomeSolutions from './components/FullHomeSolutions';
import RiyadhManufacturing from './components/RiyadhManufacturing';
import OurCapabilities from './components/OurCapabilities';
import OurItalyDesign from './components/OurItalyDesign';
import Green from './components/Green';
import QualityControl from './components/QualityControl';
import FormPanel from './components/FormPanel';
import AboutUs from './components/AboutUs';

// 数据由 App.jsx 全局挂载的 HomeDataProvider 提供（模块懒加载），这里不再单独包裹
const HomePage = () => {
  return (
    <>
      <Header />
      <HeroImage />
      <WhatCanIDoForYou />
      <FullHomeSolutions />
      <RiyadhManufacturing />
      <OurCapabilities />
      <OurItalyDesign />
      <Green />
      <QualityControl />
      <FormPanel />
      <AboutUs />
    </>
  );
};

export default HomePage;
