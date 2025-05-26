import styled from "styled-components";
import { isWhiteSpaceLike } from "typescript";

function UserStats({ name, value }: any) {
  return (
    <>
      <StatsBar val={value}>
        <p className="left-0 font-semibold">{name}</p>
        <div className="w-7 rounded-sm" style={{ backgroundColor: "#4a4e4d" }}>
          <ValueText className="right-0" val={value}>
            {value}
          </ValueText>
        </div>
      </StatsBar>
    </>
  );
}

const StatsBar = styled.div<{ val: number }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding-left: 0.375rem;
  border-radius: 0.125rem;
`;

const ValueText = styled.p<{ val: number }>`
  font-weight: 600;
  right: 0;
  color: ${(props) => {
    if (props.val < 10) {
      return "#ffffff";
    }
    return props.val < 15 ? "#D2E43A" : "#14ea68";
  }};
`;

export default UserStats;
