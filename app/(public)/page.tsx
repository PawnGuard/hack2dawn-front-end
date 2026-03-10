import { HeroSection } from "@/components/shared/hero";
import SponsorMarquee from "@/components/shared/SponsorBanner";
import { StorySection } from "@/components/shared/storySection";
import { QASection } from "@/components/shared/qa&support";

export default function LandingPage(){
    return (
        <>
            <section id="home"><HeroSection /></section>
            <section id="sponsors"><SponsorMarquee /></section>
            <section id="about"><StorySection /></section>
            <section id="faq"><QASection /></section>
        </>
    )
}