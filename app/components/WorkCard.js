import Image from "next/image";

export default function WorkCard({ imageSrc, title, role, description }) {
  return (
    <div className="w-full border-2 h-[300px] border-gray-300 rounded-4xl py-4 px-4">
      <Image
        src={imageSrc}
        className="rounded-full w-24 h-24 object-cover"
        alt={role}
        width={300}
        height={300}
      />
      <p className="text-lg font-thin">{title}</p>
      <p className="text-xl text-[#EE4266] font-bold tracking-[0.5em]">
        {role}
      </p>
      <p className="text-base font-thin pr-9">{description}</p>
    </div>
  );
}
