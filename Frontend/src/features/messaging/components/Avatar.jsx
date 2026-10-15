import { initial } from "../utils/format";

export default function Avatar({ doctor, size = 36, online = false }) {
  const style = { width: size, height: size };
  const dotSize = Math.max(10, Math.round(size * 0.26));

  return (
    <span className="msg-avatar-wrap">
      {doctor.avatar ? (
        <img src={doctor.avatar} alt="" className="msg-avatar" style={style} />
      ) : (
        <span
          className="msg-avatar msg-avatar-text"
          style={{ ...style, fontSize: size * 0.4 }}
        >
          {initial(doctor.name)}
        </span>
      )}
      {online && (
        <span
          className="msg-online-dot"
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </span>
  );
}
