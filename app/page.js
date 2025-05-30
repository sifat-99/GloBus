import BestSellingSection from "@/Components/BestSelling";
import FeatureSlider from "@/Components/FeatureSlider";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import BannerSection from "@/Components/Hero";
import Image from "next/image";

export default function Home() {
    return (
        <main className="flex-grow"> {/* Added flex-grow to allow main content to expand */}
            <Header />
            <div className="container mx-auto px-4"> {/* Optional: Wrap sections in a container for consistent padding and max-width */}
                <BannerSection />
                <FeatureSlider />
                <BestSellingSection />
            </div>
            <Footer />
        </main>
    );
}
