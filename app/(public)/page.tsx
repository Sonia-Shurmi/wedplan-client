import CategoriesSection from "@/components/sections/categories-section"
import PremiumVendorCta from "@/components/sections/cta-section"
import FeaturedServices from "@/components/sections/featured-services"
import HeroSection from "@/components/sections/hero-section"
import HowItWorks from "@/components/sections/how-it-works"
import TestimonialsSection from "@/components/sections/testimonials"
import WhyWedPlan from "@/components/sections/why-wedplan"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedServices />
      <CategoriesSection />
      <WhyWedPlan />
      <PremiumVendorCta />
      <HowItWorks />
      <TestimonialsSection />
    </>
  )
}
