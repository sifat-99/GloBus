import FeatureSlider from "@/Components/FeatureSlider";
import Header from "@/Components/Header";
import BannerSection from "@/Components/Hero";
import Image from "next/image";

export default function Home() {
    return (
        <>
            <Header />
            <BannerSection />
            <FeatureSlider />
        </>
    );
}
