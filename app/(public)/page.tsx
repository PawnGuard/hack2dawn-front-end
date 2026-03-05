import { HeroSection } from "@/components/shared/hero";
import SponsorMarquee from "@/components/shared/SponsorBanner";
import { About } from "@/components/shared/about";
import { QASection } from "@/components/shared/qa&support";
import { ScrollGallery } from "@/components/shared/schedule";

export default function LandingPage(){
    return (
        <>
            <HeroSection />
            <SponsorMarquee />
            <About />
            <ScrollGallery />
            <QASection />
        </>
    )
}