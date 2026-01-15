export default function PatternGrid({ pattern = [], size = "sm" }) {
  const sizeClass = size === "lg" ? " lg" : "";

  return (
    <div className={`face-grid${sizeClass}`}>
      {pattern.map((value, index) => (
        <div
          key={`${index}-${value}`}
          className={`sticker${value ? " y" : ""}`}
        />
      ))}
    </div>
  );
}