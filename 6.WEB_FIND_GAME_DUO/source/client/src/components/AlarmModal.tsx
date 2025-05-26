import styled from "styled-components";

function AlarmModal({ alarm, idx }: any) {
  return (
    <>
      <section className="flex flex-row justify-center items-center z-50">
        <Alarm interval={idx} className="mt-16 border">
          {window.location.href.includes("community") ? (
            <img
              src={`../icon_${alarm.type}.png`}
              width="32"
              height="32"
              className="mb-1"
            ></img>
          ) : (
            <img
              src={`./icon_${alarm.type}.png`}
              width="32"
              height="32"
              className="mb-1"
            ></img>
          )}

          <p className="text-sm font-medium">{alarm?.text}</p>
        </Alarm>
      </section>
    </>
  );
}

const Alarm = styled.div<{ interval: number }>`
  width: 640px;
  color: #333d4b;
  display: flex;
  position: fixed;
  flex-direction: column;
  background-color: white;
  height: 96px;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  z-index: 50;
  --tw-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  top: ${(props) => (props.interval ? `${props.interval * 13 + 3}%` : "3%")};
  @media screen and (max-width: 768px) {
    top: ${(props) => (props.interval ? `${props.interval * 16 + 3}%` : "3%")};
  }
  @media screen and (max-width: 640px) {
    top: ${(props) => (props.interval ? `${props.interval * 16 + 3}%` : "3%")};
    width: 320px;
  }
  @media screen and (max-width: 330px) {
    width: 260px;
  }
`;

export default AlarmModal;
