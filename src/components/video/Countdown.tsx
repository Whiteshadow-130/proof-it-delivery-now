
interface CountdownProps {
  countdown: number;
}

const Countdown = ({ countdown }: CountdownProps) => {
  return (
    <div className="text-center bg-white py-12 rounded-lg shadow-lg">
      <div className="mb-6">
        <span className="text-6xl font-bold text-brand-blue animate-pulse">{countdown}</span>
      </div>
      <p className="text-xl">Get ready to record...</p>
    </div>
  );
};

export default Countdown;
