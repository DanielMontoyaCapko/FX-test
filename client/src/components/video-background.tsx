import videoBackground from "@/assets/Video Logo Fondo_1752489214378.mp4";

export default function VideoBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <video 
        autoPlay 
        loop
        muted 
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.6)' }}
      >
        <source src={videoBackground} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/60"></div>
    </div>
  );
}