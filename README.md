# 웹 최적화 학습

해당 프로젝트의 성능을 검사하고 이를 개선해보겠습니다.

**목차**

- [웹 최적화 학습](#웹-최적화-학습)
  - [1. 초기 리포트](#1-초기-리포트)
  - [2. 개선](#2-개선)
    - [2.1 자바스크립트 실행 시간 단축](#21-자바스크립트-실행-시간-단축)
      - [2.1.1 코드 최적화 및 초기 렌더링 시 필요없는 로직 지연시키기](#211-코드-최적화-및-초기-렌더링-시-필요없는-로직-지연시키기)
      - [2.1.2 망글링](#212-망글링)
      - [2.1.3 개선 결과](#213-개선-결과)
    - [2.2 차세대 형식을 사용해 이미지 제공하기](#22-차세대-형식을-사용해-이미지-제공하기)
      - [2.2.1 이미지 변환 jgp -\> avif](#221-이미지-변환-jgp---avif)
      - [2.2.2 개선 결과](#222-개선-결과)
    - [2.3 이미지 크기 적절하게 설정하기 \& 이미지 요소에 width 및 height 명시하기](#23-이미지-크기-적절하게-설정하기--이미지-요소에-width-및-height-명시하기)
      - [2.3.1 \<picture\> 적용](#231-picture-적용)
      - [2.3.2 aspect-ratio 적용](#232-aspect-ratio-적용)
      - [2.3.3 이미지 크기 최적화](#233-이미지-크기-최적화)
      - [2.3.4 이미지 lazy-load 적용](#234-이미지-lazy-load-적용)
      - [2.3.5 개선 결과](#235-개선-결과)
    - [2.4 렌더링 차단 리소스 제거하기](#24-렌더링-차단-리소스-제거하기)
      - [2.4.1 defer 사용하기](#241-defer-사용하기)
      - [2.4.2 개선 결과](#242-개선-결과)
    - [3. 최종결과](#3-최종결과)

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

1. 코드 최적화 및 초기렌더링 시 필요없는 로직 지연시키기
2. 망글링

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

```
-rw-r--r-- 1 donghyunpark staff 365 Aug 11 17:37 main.js
-rw-r--r-- 1 donghyunpark staff 275 Aug 13 02:08 main.min.js
-rw-r--r-- 1 donghyunpark staff 2319 Aug 13 02:00 products.js
-rw-r--r-- 1 donghyunpark staff 1223 Aug 13 02:08 products.min.js
```

main.js 코드 365 -> 275
products.js 코드 2319 -> 1223

---

#### 2.1.3 개선 결과

위 두 과정을 통해서 어떤 변화가 일어났는지 확인해보겠습니다.

<img width="872" alt="image" src="https://github.com/user-attachments/assets/a53771b0-c4cd-4950-b115-b57e35cc005c">

기존 측정 결과 2.4s
개선 후 측정 결과 0.2s

박수 짝짞짝!! 엄청난 성능 향상이 일어났습니다!

**자바스크립트 실행 시간 단축 후기**
해당 프로젝트는 매우 간단한 프로젝트로 아주 간단한 기술들만 적용이 되었는데요, 만약 큰 프로젝트를 진행하시고 계시다면 트리쉐이킹, 망글링, 코드분할, 레이지로딩 등 다양한 기술들을 적용해보시면 됩니다!

---

### 2.2 차세대 형식을 사용해 이미지 제공하기

#### 2.2.1 이미지 변환 jgp -> avif

<img width="779" alt="image" src="https://github.com/user-attachments/assets/d9ba9704-1079-4fb7-a5f9-3e826f9f7f43">

현재 이미지가 jpg로 제공되고 있습니다. 이를 AVIF로 변환하면 JPG보다 이미지 압축 시 높은화질로 압축할 수 있으며, 파일 크기 또한 대폭 줄일 수 있어 웹 성능 최적화를 위해 자주 사용합니다.
<br/>
아래 사진은 avif 변환 사진입니다.
<img width="799" alt="image" src="https://github.com/user-attachments/assets/f783f4c1-ea4f-4701-922b-e516f72d5428">
<br/>

---

#### 2.2.2 개선 결과

이제 결과를 확인해봅니다!!
<img width="799" alt="image" src="https://github.com/user-attachments/assets/ed39c924-17c8-41eb-87e6-c31f588a6ae2">

개선 결과 1980kib -> 165kib
&nbsp;확연한 용량 변화를 느낄 수 있었습니다. 하지만 api로 가져오는 이미지 파일들이 전부 jpg여서 아직 노란불이군요..
최적의 방법은 아래와 같습니다.

1. 이미지를 저장할떄 avif -> 현재 불가능
2. db에 저장할때 avif로 변환하여 저장 -> 현재 불가능
3. ssr환경으로 서버에서 avif로 변환하여 저장 -> 현재불가능
4. 클라이언트에서 avif로 변환 -> 가능

&nbsp;4번의 경우 가능하지만.. 추천하지 않음 오히려 제네레이터 과정에서 오히려 렌더링시간이 더 늘어날 수 있음.. 더불어 이미 브라우저가 jpg파일을 받은 상태로 이미지 렌더링시 일부 성능 향상을 얻을수는 있지만 효과가 크리티컬하지않아, 다른 이미지 최적화 용법을 통해 최적화 하는것용이하기 때문에 **차세대 형식을 사용해 이미지 제공하기** 최적화는 여기까지만 진행하겠습니다! 현업에서는 꼭 1,2,3을 활용해주세요!

---

### 2.3 이미지 크기 적절하게 설정하기 & 이미지 요소에 width 및 height 명시하기

#### 2.3.1 \<picture> 적용

<img width="772" alt="image" src="https://github.com/user-attachments/assets/beb45dcb-5765-414b-ac70-a1bb7b154e16">

<br/>
<br/>
Lighthouse는 렌더링된 이미지 크기가 실제 크기보다 4KiB 이상 작으면 경고를 띄웁니다. 이를 위해 렌더링 사이즈에 맞게 이미지 크기를 적절하게 설정해야합니다.
<br/>
<br/>
&nbsp; 현재 이미지 구조는 다음과 같습니다.

```
    <img class="desktop" src="images/Hero_Desktop.avif" />
    <img class="mobile" src="images/Hero_Mobile.avif" />
    <img class="tablet" src="images/Hero_Tablet.avif" />
```

해당 코드의 문제점은 아래와 같습니다.

1. 같은 이미지를 표현하기위해 서로 다른 \<img/> 태그를 사용중입니다. 이는 유지보수가 어렵고 코드가 비효율적이며 아래와 같은 방법으로 해결하면 좋습니다.
   **\<picture>** 와 **\<source>** 사용

```
<picture>
  <source width="576" height="576" media="(max-width: 575px)" srcset="images/Hero_Mobile.avif" type="image/avif" />
  <source width="960" height="770" media="(min-width: 576px) and (max-width: 960px)" srcset="images/Hero_Tablet.avif" type="image/avif" />
  <source width="1920" height="893" srcset="images/Hero_Desktop.avif" type="image/avif" />

  <source width="576" height="576" media="(max-width: 575px)" srcset="images/Hero_Mobile.webp" type="image/webp" />
  <source width="960" height="770" media="(min-width: 576px) and (max-width: 960px)" srcset="images/Hero_Tablet.webp" type="image/webp" />
  <source width="1920" height="893" srcset="images/Hero_Desktop.webp" type="image/webp" />

  <source width="576" height="576" media="(max-width: 575px)" srcset="images/Hero_Mobile.jpg" type="image/jpg" />
  <source width="960" height="770" media="(min-width: 576px) and (max-width: 960px)" srcset="images/Hero_Tablet.jpg" type="image/jpg" />
  <source width="1920" height="893" srcset="images/Hero_Desktop.jpg" type="image/jpg" />
  <img width="1920" height="893" src="images/Hero_Desktop.jpg" />
</picture>
```

source는 우선, media를 통해 source를 필터하고 그 후 type조건을 활용해 최종적으로 사용할 source를 img 태그에 렌더링 시킵니다. img태그의 기본값은 최종 예외일때 사용됩니다. 이를통해 이미지 요소에 맞게 적잘한 사이즈를 사용할 수 있습니다.
<br/>
<br/>

---

#### 2.3.2 aspect-ratio 적용

&nbsp;다음은 반응형으로 영역을 잡아 사용하는 img를 레이아웃 시프트가 되지 않도록 초기영역을 지정해주겠습니다. 현재 img영역은 아래와 같습니다

```
//code
<div class="product-picture">
    <img src="images/vr1.avif" alt="product: Penom Case" />
</div>

//css
section.best-sellers .product-slider .product img {
  max-width: 40%;
}

```

해당 css는 영역이 잡혀있지않고 max-width만 설정되어있어 img가 로딩되기 전에는 영역값이 없어 레이아웃을 잡지 않습니다. 이로인해 이미지가 렌더링되면 레이아웃 시프트가되면서 이미지가 적재되고 이로인해 성능저하가 있습니다. 이를 개선하기 위해 aspect-ratio를 통하여 임시 영역을 잡아주겠습니다.

> [aspect-ratio](https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio)는 요소의 종횡비를 지정하는 css 속성, 이미지 로딩 전에도 필요한 공간을 미리 확보할 수 있어 반응형에서 레이아웃 시프트 문제를 해결하는데 효과적임.

```
//before
section.best-sellers .product-slider .product .product-picture {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
section.best-sellers .product-slider .product img {
  max-width: 40%;
}

//after
section.best-sellers .product-slider .product .product-picture {
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

section.best-sellers .product-slider .product img {
  max-width: 40%;
  max-height: 40%;
  object-fit: contain;
}

```

이제 변화를 확인해보겠습니다.

**before**
![image](https://github.com/user-attachments/assets/fa5abafb-611b-4dcd-ad06-7f299fcbdb2d)

<br/>

**after**
![스크린샷 2024-08-14 오전 10 41 07](https://github.com/user-attachments/assets/a27b91e1-838d-4fd5-988c-3beba4479060)

레이아웃 시프트가 확연히 개선되었습니다!!

---

#### 2.3.3 이미지 크기 최적화

현재 렌더링되는 화면에 비해 사이가 과도하게 큰 이미지들이 있습니다. 이를 최적화된 크기로 자르고 압축하여 사이즈를 최적화 해봅시다.

<br/>

![image](https://github.com/user-attachments/assets/18909f54-d008-41d2-9670-d0466eca0f51)

avif로 변환을 하였으나, 여전히 큰 사이즈들이 있습니다. 이유는 해당 이미지 크기가 현재 렌더링되는 화면에 비해 과도하게 크며, 압축이 덜 되어있어 용량이 큰 편입니다. 이를 개선하기위해 아래 작업들을 진행하였습니다.

1. 이미지 사이즈 조정(렌더링 및 fixed된 size에 맞게 크기 조정)
2. 이미지 압축(그래픽이 크게 손상되지 않는 수준에서 최대한 압축)
3. ## jpg -> avif, webp 변환

#### 2.3.4 이미지 lazy-load 적용

상품 목록 리스트를 api로 불러오고, 이를 렌더링시킬때 아직 뷰포트에 잡히지 않은 이미지까지 전부 다운로드받아 초기렌더링 및 네트워크 낭비를 일으키고 있습니다. 이를 개선하기위해 이미지에 레이지로딩을 적용해보겠습니다.

해당 로직은 아래와 같습니다.

1. img태그의 src를 임시 어트리뷰트 dataset.src에 넣어줍니다

```
img.dataset.src = product.image;
```

2. intersectionobserver를 통하여 해당 Img를 감시합니다.
3. Img가 설정한 뷰포트의 지점에 도달하면 Img의 dataset.src 속성을 src에 넣어줍니다.
4. 더 이상 감지할 필요가 없으니 unobserve를 통해 감지를 취소해줍시다.

위 과정을 통하여 레이지로딩을 구현할 수 있습니다. 로직은 아래와 같습니다.

```
const onIntersection = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
};

const observer = new IntersectionObserver(onIntersection, {
  root: null, // 뷰포트
  threshold: 0.1, // 10%가 보이면 콜백 실행
});

...
//이미지 dataset.src 추가 및 감지부분
const img = document.createElement('img');
img.dataset.src = product.image;
observer.observe(img);
```

해당 코드를 통해 이전과 다르게 사이트에 접속 시 뷰포트에 있는 이미지만 로드하는것을 보실 수 있습니다.
![image](https://github.com/user-attachments/assets/3d70ee4f-1ca0-4762-9f8a-fac2b479941f)

---

#### 2.3.5 개선 결과

자 이제 얼마나 개선되었는지 지표를 확인해볼까요?
![image](https://github.com/user-attachments/assets/f4ca7ca8-6134-437b-b756-ee68e8f715c1)
![image](https://github.com/user-attachments/assets/6e6ad395-702d-4b66-a84d-6ed30230b02a)
![image](https://github.com/user-attachments/assets/0be71f54-e2fa-44ae-bfc7-14397ac5d495)

이미지 관련된 지표가 모두 정상화 되었습니다!! 짝짝짝짝

---

### 2.4 렌더링 차단 리소스 제거하기

<img width="776" alt="image" src="https://github.com/user-attachments/assets/3e928ab4-40a0-4206-8755-80f4e3aabe0c">
cookie-consent.js가 LCP와 FCP를 방해하고 있다고 설명되어 있는데요, cookie-consent.js를 어떻게 호출하고있나 확인해보겠습니다.

<br/>
<br/>

```
<head>
  <!-- Cookie Consent by FreePrivacyPolicy.com https://www.FreePrivacyPolicy.com -->
  <script
    type="text/javascript"
    src="//www.freeprivacypolicy.com/public/cookie-consent/4.1.0/cookie-consent.js"
    charset="UTF-8"
  ></script>
  <script type="text/javascript" charset="UTF-8">
    cookieconsent.run({
      notice_banner_type: 'simple',
      consent_type: 'express',
      palette: 'light',
      language: 'en',
      page_load_consent_levels: ['strictly-necessary'],
      notice_banner_reject_button_hide: false,
      preferences_center_close_button_hide: false,
      page_refresh_confirmation_buttons: false,
      website_name: 'Performance Course',
    });
  </script>
</head>
```

#### 2.4.1 defer 사용하기

해당 이슈를 해결하기 위해서는 \<head> 태그에 대한 이해가 있어야 합니다.

&nbsp;현재 구조에서의 문제점은 \<head>태그 안에 동기적으로 스크립트를 로딩하고있는 점입니다. 이런식으로 스크립트를 헤더안에 넣으면 해당 스크립트를 완전히 다운로드하고 실행할 떄까지 다른 HTML요소의 로드를 중단합니다. 이로인해 페이지 렌더링이 느려지며, SEO또한 부정적인 영향을 줄 수 있습니다.(크롤러가 인덱싱하기 힘듬)

위 이슈를 해결하기 위해 비동기로 script를 동적 로딩하거나, body의 끝으로 이동하면 됩니다. 저는 body끝으로 이동시켜 defer를 적용하겠습니다.

```
<body>
  <script
        type="text/javascript"
        src="//www.freeprivacypolicy.com/public/cookie-consent/4.1.0/cookie-consent.js"
        charset="UTF-8"
        defer
  ></script>
  <script type="text/javascript" charset="UTF-8" defer>
    cookieconsent.run({
      notice_banner_type: 'simple',
      consent_type: 'express',
      palette: 'light',
      language: 'en',
      page_load_consent_levels: ['strictly-necessary'],
      notice_banner_reject_button_hide: false,
      preferences_center_close_button_hide: false,
      page_refresh_confirmation_buttons: false,
      website_name: 'Performance Course',
    });
  </script>
</body>
```

---

#### 2.4.2 개선 결과

<img width="776" alt="image" src="https://github.com/user-attachments/assets/66fb09e4-13e6-4235-9376-e027d5b28081">

통과되었습니다!!

---

### 3. 최종결과

![Screen Shot 2024-08-16 at 12 20 20 AM](https://github.com/user-attachments/assets/bb9b0c60-82f0-45fc-96b1-a63472018b2b)
최종 결과입니다!.
성능: 40 -> 100
접근성: 82 -> 100
관련사항: 93 -> 96
검색엔진 최적화: 82 -> 100
