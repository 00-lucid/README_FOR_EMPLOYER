# CommandListener 설계 가이드

React의 기본 동작방식은 현재 상태를 렌더링 하도록 되어있다.

useEffect나 useCallback 등도 최종 실행 결과는 상태를 업데이트 하고 그것을 렌더링 하는 것이다.

대부분의 어플리케이션 프레임워크에서 객체는 메소드와 프로퍼티로 이루어 진다.

그러나 React는 메소드에 해당하는 forwardRef의 사용을 지양하도록 가이드 하고 있다.

이런 조건에서 마크업과 도면열기 등 다양한 기능의 조합은 구현을 어렵게 만드는데, 기능이 조합될 수록 상태가 많아지고 상태가 많아질수록 경우의 수가 많아져서 관리하기 어렵기 때문이다.

몇 가지 경우를 생각해 보자

가장 기본적인 도면선택에서 발생할 수 있는 시나리오다.

> 1. 도면 메뉴에서 도면 선택
> 1. 마크업 편집 모드인가?
>     1. 마크업 저장할까요? 화면 표시
>     1. 마크업 저장할까요?에서 '예'를 선택
>     1. 마크업 저장 화면 표시
>     1. 마크업 정보 입력 후 '예'를 선택
> 1. 도면이 현재 선택되어 있는 상태인가?
> 1. 현재 도면과 다른 도면이면 서버에서 도면 로딩
> 1. 도면이 로딩 완료 대기
> 1. zoomExtents

위의 시나리오에서 '마크업 저장할까요?', '마크업 저장하기' 화면을 출력하려면, 작업이 완료되면 다음 작업을 실행하기 위한 정보를 포함하는 각각의 상태를 가져야 할 것이다. 도면 로딩을 기다리고 완료되면 zoomExtents를 실행해야 하는 것을 상태로 구현하려면 얼마나 많은 상태와 경우의 수가 발생할 것인가.

그리고 이런 순서를 가지는 시나리오가 몇 개는 더 있다.

이런 문제를 극복하기 위해서 CommandListener를 만들었다.

## CommandListener

CommandListener는 Command 패턴과 Observer 패턴의 일부 기능을 조합한 것이다.
CommandListener는 Command를 순차적으로 실행한다.
이를 위해서 setHandler, pushCommand, continueListener 함수가 존재한다.
위 함수가 CommandListener의 멤버가 아닌 것에 주의해야 한다.
pushCommand 등을 실행하면 CommandListener의 commands 상태가 변경된다. 이것은 useCommandListener를 사용하면 모든 React.Component가 변경되고 pushCommand를 호출하는 useCallback도 변경되는 것이다. 즉, 재귀호출에 의한 데드락이 발생한다.
따라서 dispatchEvent로 이벤트를 CommandListener에 전달하는 것이다.

```javascript
export function pushCommand(commands: Command[] | Command) {
    var event = new CustomEvent('pushCommand', { detail: { commands } })

    document.dispatchEvent(event)
}
```

이렇게 하면 CommandListener에 command가 추가되어도 pushCommand를 사용하는 callback 함수는 영향을 받지 않는다.

### pushCommand

pushCommand는 command를 생성하고 요청한다.
value는 command 마다 형식이 다르다.

```javascript
const value = {
    docKey: { docId: drawing, docVer: revision },
    plantCode: plant
}

pushCommand({ name: 'openDocument', value })
```

### setHandler

setHandler는 command의 실행 동작을 정의한다.

```javascript
setHandler('openDocument', async (value: SelectedDocument) => {
    const docFile = await Repository.getDocumentFile(value.docKey)

    setDocFile(docFile)
})
```

setHandler로 지정되는 callback은 대부분 return을 생략한다.

그러나 몇몇 특별한 경우에 `return false|undefiend`를 한다.

```javascript
React.useEffect(() => {
    setHandler('openDocument', async (value: SelectedDocument) => {
        return await openDocument(value)
    })
}, [openDocument])
```

CommandListerner는 다수의 commands가 있을 때 handler에서 command 처리가 끝나면 자동으로 다음 handler를 호출한다.
그런데 만약 handler가 return false를 한다면 실행을 멈춘다.

### continueListener

handler에서 return false로 실행이 멈춘다면 `continueListener()`를 호출해서 재시작 할 수 있다.

```javascript
export function continueListener() {
    var event = new CustomEvent('continueListener', { detail: {} })

    document.dispatchEvent(event)
}
```

이렇게 일시정지/실행을 구현한 이유는 'openDocument'를 고려한 것이다.
openDocument는 도면을 로딩하는 데 시간이 오래 걸린다. 그 시간 동안 앱이 멈추지 않으려면 비동기로 처리해야 하는데 그렇게 하면 openDocument가 완료되지 않았는데 다음 command를 실행하게 된다.

아래의 코드를 보자.

```javascript
pushCommand({ name: 'openDocument' })
pushCommand({ name: 'selectEquipment' })
```

openDocument 후 일시정지를 하지 않는다면 selectEquipment가 바로 실행된다. 그러나 selectEquipment는 openDocument가 완료되지 않으면 현재 도면과 일치하지 않아서 오류가 된다.

## 결론

CommandListener는 forwardRef를 최대한 배제하고 useState로 구현하기 위한 고육지책이다. 그러나 farpoint와 같은 완전한 Single Page App이라면 forwardRef가 안티패턴이라고 할 수 없다.
다시 개발한다면 Mediator 패턴과 forwardRef를 사용해서 구현할 것 같다.
