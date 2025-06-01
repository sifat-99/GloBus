'use client'; // Make this a client component to use framer-motion

import BestSellingSection from "@/Components/BestSelling";
import FeatureSlider from "@/Components/FeatureSlider";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import BannerSection from "@/Components/Hero";
import { motion } from "framer-motion";

const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function Home() {
    return (
        <main className="flex-grow"> {/* Added flex-grow to allow main content to expand */}
            <Header />
            <div className="container mx-auto px-4"> {/* Optional: Wrap sections in a container for consistent padding and max-width */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" viewport={{ once: true, amount: 0.3 }}>
                    <BannerSection />
                </motion.div>
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.2 }}>
                    <FeatureSlider />
                </motion.div>
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" viewport={{ once: true, amount: 0.3 }} transition={{ delay: 0.4 }}>
                    <BestSellingSection />
                </motion.div>
            </div>
            {/* Footer can also have an entrance animation if desired */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
            >
                <Footer />
            </motion.div>
        </main>
    );
}
