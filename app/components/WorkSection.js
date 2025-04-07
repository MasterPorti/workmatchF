import WorkCard from "./WorkCard";

export default function WorkSection({ cards }) {
  return (
    <div className="flex gap-10 mx-16 h-[300px] justify-between">
      {cards.map((card, index) => (
        <WorkCard
          key={index}
          imageSrc={card.imageSrc}
          title={card.title}
          role={card.role}
          description={card.description}
        />
      ))}
    </div>
  );
}
