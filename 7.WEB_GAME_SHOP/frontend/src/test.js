const d = [1, 3, 2, 5, 4];
const budget = 9;

function solution(d, budget) {
  var count = 0;

  // 1. sort d 오름차
  d = d.sort((x, y) => x - y);
  // 2. 반복문 for
  for (let el of d) {
    if (el > budget) {
      // 2-1. 예산초과O -> break;
      break;
    } else {
      // 2-2. 예산초과X -> count++, 반복문 재실행
      budget -= el;
      count++;
    }
  }

  return count;
}

console.log(solution(d, budget));
