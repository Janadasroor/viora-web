'use client';

import { motion } from "framer-motion";
import { Sparkles, Star, Zap, Shield } from "lucide-react";

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <div className="flex flex-col items-center text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="w-24 h-24 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8 rotate-6 hover:rotate-0 transition-transform duration-500 shadow-xl shadow-primary/5"
            >
                <Sparkles size={48} className="animate-pulse" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
                Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Viora</span>
            </h1>

            <p className="text-muted-foreground text-lg max-w-md mb-12 leading-relaxed">
                We're excited to have you here. Let's set up your profile to make your experience truly personal and inspiring.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                {[
                    { icon: Star, title: "Discover", desc: "Premium content tailored for you." },
                    { icon: Zap, title: "Connect", desc: "Interact with an active community." },
                    { icon: Shield, title: "Secure", desc: "Your data, protected and private." }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="bg-muted/30 p-4 rounded-2xl border border-border/50 text-left hover:bg-muted/50 transition-colors group"
                    >
                        <feature.icon size={20} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-foreground mb-1">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                ))}
            </div>

            <button
                onClick={onNext}
                className="group relative w-full md:w-auto px-12 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/25"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Get Started
            </button>
        </div>
    );
}
