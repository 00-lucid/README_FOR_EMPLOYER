// 특정 요소에서 scrollTop 값을 얻기
window.getScrollTop = (elementId) => {
    var element = document.getElementById(elementId);
    if (element) {
        return element.scrollTop;
    }
    return 0; // 기본값
};

// 특정 요소의 scrollHeight 값을 얻기
window.getScrollHeight = (elementId) => {
    var element = document.getElementById(elementId);
    if (element) {
        return element.scrollHeight;
    }
    return 0; // 기본값
};

// 특정 요소의 clientHeight 값을 얻기
window.getClientHeight = (elementId) => {
    var element = document.getElementById(elementId);
    if (element) {
        return element.clientHeight;
    }
    return 0; // 기본값
};

window.getElementHeight = (elementId) => {
    var element = document.getElementById(elementId);
    if (element) {
        return element.offsetHeight; // 해당 요소 높이를 반환
    }
    return 0; // 기본값
};

window.isElementVisible = (elementId, containerId) => {
    const element = document.getElementById(elementId);
    const container = document.getElementById(containerId);

    if (element && container) {
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // Check if the element is within the container's visible area
        return (
            elementRect.bottom > containerRect.top &&
            elementRect.top < containerRect.bottom
        );
    }
    return false; // 요소나 컨테이너가 존재하지 않는 경우
};

window.typeEffect = (elementId, speed) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const text = element.innerText; // 원래 텍스트를 저장
    element.innerHTML = ''; // 텍스트를 초기화

    let index = 0; // 타이핑 시작 위치

    // 타이핑 효과를 위한 interval
    const timer = setInterval(() => {
        if (index < text.length) {
            // 현재 문자가 공백인 경우 &nbsp;로 대체
            const char = text[index] === ' ' ? '&nbsp;' : text[index];
            element.innerHTML += char; // innerHTML에 추가
            index++;
        } else {
            clearInterval(timer); // 타이핑 완료 시 interval 종료
        }
    }, speed);
};