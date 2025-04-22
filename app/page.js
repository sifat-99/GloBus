import BestSellingSection from "@/Components/BestSelling";
import FeatureSlider from "@/Components/FeatureSlider";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import BannerSection from "@/Components/Hero";
import Image from "next/image";

export default function Home() {
    return (
        <>
            <Header />
            <BannerSection />
            <FeatureSlider />
            <BestSellingSection />
            <Footer />
        </>
    );
}
