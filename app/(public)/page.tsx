import { HeroSection } from "@/components/shared/hero";
import SponsorMarquee from "@/components/shared/SponsorBanner";
import { QASection } from "@/components/shared/qa&support";
import { ScrollGallery } from "@/components/shared/schedule";

export default function LandingPage(){
    return (
        <>
            <HeroSection />
            <SponsorMarquee />
            <ScrollGallery />
            <QASection />
        </>
    )
}