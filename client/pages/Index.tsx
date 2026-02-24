import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SlidingHero from "../components/SlidingHero";
import FeaturesSection from "../components/FeaturesSection";
import SlidingTestimonials from "../components/SlidingTestimonials";

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Rocs Crew | Fast & Reliable Logistics in Kenya</title>
        <meta name="description" content="Rocs Crew provides professional courier and logistics services across Kenya. Fast, secure, and reliable deliveries for businesses and individuals." />
      </Helmet>
      <SlidingHero />
      <FeaturesSection />
      <SlidingTestimonials />
    </div>
  );
}
