import Image from "next/image";
import { HiArrowRight } from "react-icons/hi";
import Link from "next/link";

export default function HeroSection({
  title,
  subtitle,
  description,
  imageSrc,
  buttonText,
  buttonText2,
  buttonPath,
  buttonPath2,
}) {
  return (
    <div className="flex items-center h-[80vh] justify-center mx-28">
      <div className="w-1/2 flex flex-col gap-4 justify-center">
        <div>
          <p className="text-5xl font-thin">{title}</p>
          <p className="text-[#EE4266] text-5xl font-thin">{subtitle}</p>
          <p className="text-5xl font-thin">de América Latina.</p>
        </div>
        <div className="flex flex-col justify-center">
          <span className="font-bold text-base">{description[0]}</span>
          <span className="font-bold text-base">{description[1]}</span>
        </div>
        <div className="flex gap-4 mt-4">
          <Link
            href={buttonPath}
            className="bg-[#EE4266] hover:bg-[#EE4266]/80 hover:scale-105 transition-all duration-300 cursor-pointer text-white px-4 py-2 rounded-full"
          >
            {buttonText}
          </Link>
          <Link
            href={buttonPath2}
            className="text-[#EE4266] hover:text-[#EE4266]/80 hover:scale-105 transition-all duration-300 cursor-pointer justify-center px-4 py-2 flex items-center gap-2"
          >
            <p>{buttonText2}</p>
            <HiArrowRight className="text-lg pt-0.5" />
          </Link>
        </div>
      </div>
      <div className="w-1/2">
        <Image
          src={imageSrc}
          alt="Hero"
          width={1000}
          height={1000}
          className="rounded-4xl object-cover w-full h-full"
        />
      </div>
    </div>
  );
}
