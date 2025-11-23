import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const affirmations = [
  "나는 내 하루를 스스로 조율할 힘이 있다.",
  "나는 내가 할 수 있는 만큼 꾸준히 나아가고 있다.",
  "나는 어떤 일이 와도 차분히 맞이할 수 있다.",
  "나는 나에게 주어진 작은 순간들을 잘 활용할 수 있다.",
  "나는 실수하더라도 다시 시작할 힘을 가지고 있다.",
];

interface AffirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AffirmationModal = ({ isOpen, onClose }: AffirmationModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen && currentIndex < affirmations.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A5D4A] via-[#3D4E3D] to-[#2D3D2D]" />

        {/* Content */}
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-center space-y-8">
            <motion.h1
              className="text-3xl font-bold text-primary"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              오늘의 긍정 확언
            </motion.h1>

            <motion.p
              className="text-base text-primary-foreground/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              아래 확언을 하나씩 읽고 말해보세요
            </motion.p>

            {/* Affirmations */}
            <div className="space-y-4 min-h-[300px]">
              {affirmations.map((affirmation, index) => (
                <AnimatePresence key={index}>
                  {currentIndex >= index && (
                    <motion.div
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index === currentIndex ? 0 : 0 }}
                    >
                      <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-left text-primary-foreground text-base">{affirmation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* Button */}
            {currentIndex === affirmations.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={onClose}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-2xl"
                >
                  화이팅!
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AffirmationModal;
