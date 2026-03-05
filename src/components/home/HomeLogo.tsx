
const LOGO_URL = "https://kjfwyaniengzduyeeufq.supabase.co/storage/v1/object/public/logos/klatsch-logo.png";

export const HomeLogo = () => {
  return (
    <header className="text-center mb-12">
      <div className="flex justify-center mb-4">
        <img 
          src={LOGO_URL} 
          alt="The Klatsch" 
          className="h-20 md:h-24" 
        />
      </div>
    </header>
  );
};
