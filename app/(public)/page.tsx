import { HeroSection } from "@/components/shared/hero";
import SponsorMarquee from "@/components/shared/SponsorBanner";
import { StorySection } from "@/components/shared/storySection";
import { QASection } from "@/components/shared/qa&support";
import { EvervaultCard } from "@/components/ui/evervault-card";

export default function LandingPage(){
    return (
        <>
            <HeroSection />
            <SponsorMarquee />
            <StorySection />
        </>
    )
}