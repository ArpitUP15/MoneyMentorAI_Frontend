import { useEffect, useRef, useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ChooseUs from './components/ChooseUs';
import Work from './components/Work';
import Footer from './components/Footer';
import StatsSection from './components/Stats';
import FAQSection from './components/FAQ';
import Chatbot from './components/Chatbot';

function App() {
  const [mousePointer, setMousePointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMousePointer({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const homeRef = useRef(null);
  const workRef = useRef(null);
  const aboutusRef = useRef(null);
  const featuresRef = useRef(null);
  const faqRef = useRef(null);

  const cursor = {
    position: 'fixed',
    top: mousePointer.y,
    left: mousePointer.x,
    width: '80px',
    height: '80px',
    backgroundColor: '#60A5FA',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 9999,
    opacity: 1,
    filter: 'blur(80px)',
    pointerEvents: 'none',
    transition: 'top 0.03s linear, left 0.03s linear',
  };

  return (
    <div className="font-[Poppins]">
      <div style={cursor} aria-hidden="true" />
      <div className='bg-no-repeat bg-cover bg-[url("https://media.istockphoto.com/id/2030192156/photo/global-data-flow-and-connectivity-east-asia.webp?b=1&s=612x612&w=0&k=20&c=igZA6fE1A6qq0jyHDRUAxtbuHeQu2pqiRTdr4t2BPfI=")]'>
        <Navbar
          homeRef={homeRef}
          workRef={workRef}
          aboutusRef={aboutusRef}
          featuresRef={featuresRef}
          faqRef={faqRef}
        />
        <div id="homeRef" ref={homeRef}>
          <HeroSection />
        </div>
      </div>

      <div className="bg-gradient-to-b from-[#0c121b] to-[rgb(31,41,55)]">
        <div id="featuresRef" ref={featuresRef}>
          <ChooseUs />
        </div>
        <StatsSection />
        <div id="workRef" ref={workRef}>
          <Work />
        </div>
        <div id="faqRef" ref={faqRef}>
          <FAQSection />
        </div>
        <div id="aboutusRef" ref={aboutusRef}>
          <Footer />
        </div>
      </div>

      <Chatbot />
    </div>
  );
}

export default App;
