import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit3 } from "lucide-react";

interface OneThingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  initialValue?: string;
}

const OneThingModal = ({ isOpen, onClose, onSave, initialValue = "" }: OneThingModalProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = () => {
    if (value.trim()) {
      onSave(value);
      setValue("");
    }
  };

  const handleClose = () => {
    setValue("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#4A5D4A] via-[#3D4E3D] to-[#2D3D2D]" 
          onClick={handleClose}
        />

        {/* Content */}
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-6">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold text-primary mb-2">오늘의 ONE-THING</h1>
              <p className="text-base text-primary-foreground/80">오늘 이것만큼은 하기로 약속해요!</p>
            </motion.div>

            <motion.div
              className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-start gap-3 mb-4">
                <Edit3 className="w-5 h-5 text-primary shrink-0 mt-1" />
                <Input
                  placeholder="꼭 자세하고 거창할 필요는 없어요. 지금 생각나는 걸 적어봐요"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-transparent border-0 border-b border-primary/30 rounded-none px-0 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-0 focus-visible:border-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={!value.trim()}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold rounded-2xl disabled:opacity-50"
              >
                <div className="w-6 h-6 bg-primary-foreground/20 rounded-full flex items-center justify-center mr-2">
                  ↑
                </div>
                확인
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OneThingModal;
