import { motion } from "framer-motion";

const MotionImg = motion.img;

function Loader({ setLoading }) {
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#C3E8FF] to-[#FFFFFF]">
      <MotionImg
        src="/logo.png"
        alt="kkd"
        className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={{ clipPath: "inset(0 0% 0 0)" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        onAnimationComplete={() => setLoading(false)}
      />
    </div>
  );
}

export default Loader;
