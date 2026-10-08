import { HomeDataProvider } from './context/HomeDataContext';
import Header from './components/Header';
import HeroImage from './components/HeroImage';
import WhatCanIDoForYou from './components/WhatCanIDoForYou';
import FullHomeSolutions from './components/FullHomeSolutions';
import RiyadhManufacturing from './components/RiyadhManufacturing';
import OurCapabilities from './components/OurCapabilities';
import OurItalyDesign from './components/OurItalyDesign';
import FormAndBranch from './components/FormAndBranch';
import QualityControl from './components/QualityControl';
import FormPanel from './components/FormPanel';
import AboutUs from './components/AboutUs';

const HomePage = () => {
  return (
    <HomeDataProvider>
      <Header />
      <HeroImage />
      <WhatCanIDoForYou />
      <FullHomeSolutions />
      <RiyadhManufacturing />
      <OurCapabilities />
      <OurItalyDesign />
      <FormAndBranch />
      <QualityControl />
      <FormPanel />
      <AboutUs />
    </HomeDataProvider>
  );
};

export default HomePage;
