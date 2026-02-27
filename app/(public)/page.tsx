import { HeroSection } from "@/components/shared/hero";
import SponsorMarquee from "@/components/shared/SponsorBanner";
import { QASection } from "@/components/shared/qa&support";

export default function LandingPage(){
    return (
        <>
            <HeroSection />
            <SponsorMarquee />
            <QASection />
        </>
    )
}