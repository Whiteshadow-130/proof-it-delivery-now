
interface CountdownProps {
  countdown: number;
}

const Countdown = ({ countdown }: CountdownProps) => {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <span className="text-6xl font-bold animate-pulse">{countdown}</span>
      </div>
      <p className="text-xl">Get ready to record...</p>
    </div>
  );
};

export default Countdown;
