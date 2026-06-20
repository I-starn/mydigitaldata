'use client';
import { motion } from 'framer-motion';

export default function NeonBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-darkBg">
      {/* Cyan Blob */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-neonCyan opacity-20 blur-[100px]"
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ top: '10%', left: '15%' }}
      />
      {/* Pink Blob */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full bg-neonPink opacity-[0.15] blur-[110px]"
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -80, 0],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ bottom: '15%', right: '10%' }}
      />
      {/* Purple Blob */}
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full bg-neonPurple opacity-20 blur-[90px]"
        animate={{
          x: [0, 50, -60, 0],
          y: [0, 60, -40, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{ bottom: '40%', left: '40%' }}
      />
    </div>
  );
}