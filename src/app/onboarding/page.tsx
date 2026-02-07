'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    User,
    Camera,
    Hash,
    Users,
    ChevronRight,
    ChevronLeft,
    Check,
    Star,
    Sparkles
} from "lucide-react";

// Steps Components (to be implemented or imported)
import WelcomeStep from "./steps/WelcomeStep";
import ProfileStep from "./steps/ProfileStep";
import PictureStep from "./steps/PictureStep";
import FollowStep from "./steps/FollowStep";

const steps = [
    { id: 'welcome', title: 'Welcome', icon: Sparkles },
    { id: 'profile', title: 'Profile', icon: User },
    { id: 'picture', title: 'Picture', icon: Camera },
    { id: 'follow', title: 'Follow', icon: Users },
];

export default function OnboardingPage() {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [onboardingData, setOnboardingData] = useState({
        displayName: "",
        bio: "",
        location: "",
        gender: "",
        birthDate: "",
        profilePicture: null as File | null,
        selectedInterests: [] as string[],
        followedUsers: [] as string[],
    });

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push("/feed");
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateData = (newData: Partial<typeof onboardingData>) => {
        setOnboardingData(prev => ({ ...prev, ...newData }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
            {/* Progress Bar */}
            <div className="w-full max-w-2xl mb-8">
                <div className="flex justify-between items-center mb-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center flex-1">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${index <= currentStep
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110'
                                    : 'bg-muted text-muted-foreground'
                                    }`}
                            >
                                {index < currentStep ? <Check size={20} /> : <step.icon size={20} />}
                            </div>
                            <span className={`text-[10px] mt-2 font-medium uppercase tracking-wider ${index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                                }`}>
                                {step.title}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />
                </div>
            </div>

            {/* Step Content Outer Container */}
            <div className="w-full max-w-2xl relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "backOut" }}
                        className="glass rounded-3xl p-8 md:p-12 shadow-2xl border-white/10"
                    >
                        {currentStep === 0 && <WelcomeStep onNext={nextStep} />}
                        {currentStep === 1 && <ProfileStep data={onboardingData} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />}
                        {currentStep === 2 && <PictureStep data={onboardingData} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />}
                        {currentStep === 3 && <FollowStep data={onboardingData} onUpdate={updateData} onFinish={nextStep} onBack={prevStep} />}
                    </motion.div>
                </AnimatePresence>
            </div>

        </div>
    );
}
