export default function WarDetails({ war }) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl">
      <h2 className="text-lg font-semibold">{war.title}</h2>
      <p>Type: {war.type}</p>
      <p>Mode: {war.mode}</p>
      {war.type !== "wins" && <p>War Points: {war.warPoints}</p>}
      <p>Prize: ₹{war.prize}</p>
      {war.sponsors && <p>Sponsors: {war.sponsors}</p>}
      <p>Matches Played: {war?.matches?.length}/5</p>
    </div>
  );
}