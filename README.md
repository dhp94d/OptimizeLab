# 웹 최적화 학습

해당 프로젝트의 성능을 검사하고 이를 개선해보겠습니다.

**목차**

- [웹 최적화 학습](#웹-최적화-학습)
  - [1. 초기 리포트](#1-초기-리포트)
  - [2. 개선](#2-개선)
    - [2.1 자바스크립트 실행 시간 단축](#21-자바스크립트-실행-시간-단축)
      - [2.1.1 코드 최적화 및 초기 렌더링 시 필요없는 로직 지연시키기](#211-코드-최적화-및-초기-렌더링-시-필요없는-로직-지연시키기)
      - [2.1.2 망글링](#212-망글링)
      - [2.1.3 결과](#213-결과)

---

## 1. 초기 리포트

**pageSpeed insinsights mobile 기준**

<img width="694" alt="Screen Shot 2024-08-13 at 12 21 55 AM" src="https://github.com/user-attachments/assets/4a4de0d8-f3dd-4466-8e19-ed9cd858b935">
<img width="694" alt="Screen Shot 2024-08-13 at 12 22 10 AM" src="https://github.com/user-attachments/assets/1dba9cd1-a767-48f2-ad9a-8b9034588fc5">
<img width="694" alt="Screen Shot 2024-08-13 at 12 22 23 AM" src="https://github.com/user-attachments/assets/02dc62b2-3be0-47df-b2ea-1b3c755bd61e">
<img width="694" alt="Screen Shot 2024-08-13 at 12 22 27 AM" src="https://github.com/user-attachments/assets/e4042948-2489-4709-a1b5-ad4c7d83317e">
<img width="694" alt="Screen Shot 2024-08-13 at 12 22 30 AM" src="https://github.com/user-attachments/assets/91ace94a-9a9d-4a27-80a8-526d7825d436">

위 리포트를 순차적으로 개선하며 개선해보겠습니다.

---

## 2. 개선

### 2.1 자바스크립트 실행 시간 단축

<img width="858" alt="image" src="https://github.com/user-attachments/assets/4323da42-4a04-4f6a-8973-291cef0b211d">

자바스크립트 실행 시간 단축은 사용자 인터렉션과 중요한 상관관계가 있습니다.

&nbsp;자바스크립트는 싱글 스레드로, 자바스크립트가 하이드레이션 되는 과정은 모두 메인 스레드에서 진행됩니다. 이때 사용자는 어떠한 인터렉션(클릭, 스크롤, 키보드 입력)등을 진행할 수 없으며 이 시간동안을 **TBT** 라고 부릅니다.
&nbsp;위 이미지는 TBT가 2.4초 라는 의미이며, 이는 FCP와 TTI 사이의 시간을 의미합니다. 이를 개선하기 위한 방법은 해당 링크를 확인해주세요. [자바스크립트 실행 시간 단축 방법](https://developer.chrome.com/docs/lighthouse/performance/bootup-time?utm_source=lighthouse&utm_medium=lr&hl=ko)

현재 프로젝트에서 적용할 만한 개선방법은 아래와 같습니다.

1.  코드 최적화 및 초기렌더링 시 필요없는 로직 지연시키기
2.  망글링

개선을 진행하겠습니다.

#### 2.1.1 코드 최적화 및 초기 렌더링 시 필요없는 로직 지연시키기

[requestIdleCallback](https://developer.mozilla.org/ko/docs/Web/API/Window/requestIdleCallback)

렌더링시 필요없는 로직을 **requestIdleCallback**를 통해서 TBT를 우회하고, 최적의 시기에 실행하도록 구현하였습니다.

requestIdleCallback는 web api로 user agent가 자유 시간이 있다고 판단하면, 태스크 큐에 해당 작업을 추가하는 함수입니다. 현재 레포 소스에서 리플로우, 리페인트에 지장을 주지 않으면서 작업시간이 가장 큰 코드는 아래와 같습니다. 이를 **requestIdleCallback**를 사용하여 최적화를 진행하였습니다.

```
//before
for(let i = 0; i < 10000000; i++){
  const temp = Math.sqrt(i) * Math.sqrt(i);
}

//after
const heavyOperationAsync = () => {
  for (let i = 0; i < 10000000; i++) {
    const temp = Math.sqrt(i) * Math.sqrt(i);
  }
};

requestIdleCallback(heavyOperationAsync, { timeout: 3000 });
```

#### 2.1.2 망글링

&nbsp; 망글링이란 자바스크립트 코드에서 변수명, 함수명을 줄여 코드 전체 크기를 줄이는 기술입니다. 이를통해 전송 시간과 파싱 시간을 줄일 수 있습니다.
**terser**을 통해 망글링을 진행하였으며 효과는 아래와 같습니다.

-rw-r--r-- 1 donghyunpark staff 365 Aug 11 17:37 main.js
-rw-r--r-- 1 donghyunpark staff 275 Aug 13 02:08 main.min.js
-rw-r--r-- 1 donghyunpark staff 2319 Aug 13 02:00 products.js
-rw-r--r-- 1 donghyunpark staff 1223 Aug 13 02:08 products.min.js

main.js 코드 365 -> 275
products.js 코드 2319 -> 1223

#### 2.1.3 결과

위 두 과정을 통해서 어떤 변화가 일어났는지 확인해보겠습니다.

<img width="872" alt="image" src="https://github.com/user-attachments/assets/a53771b0-c4cd-4950-b115-b57e35cc005c">

기존 측정 결과 2.4s
개선 후 측정 결과 0.2s

박수 짝짞짝!! 엄청난 성능 향상이 일어났습니다!

**자바스크립트 실행 시간 단축 후기**
해당 프로젝트는 매우 간단한 프로젝트로 아주 간단한 기술들만 적용이 되었는데요, 만약 큰 프로젝트를 진행하시고 계시다면 트리쉐이킹, 망글링, 코드분할, 레이지로딩 등 다양한 기술들을 적용해보시면 됩니다!
