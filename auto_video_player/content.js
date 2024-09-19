// 페이지가 로드될 때 URL에 따라 분기 처리
const currentURL = window.location.href;
console.log("hi");
console.log(currentURL);

// URL에 'main'이 포함된 경우 proceedWithTodoList 실행
if (currentURL.includes("main")) {
  console.log("URL contains 'main'. Executing proceedWithTodoList...");
  startAutomation();
}

// URL에 'online_list_form' 또는 'online_time_view_form'이 포함된 경우 handleNewPage 실행
else if (
  currentURL.includes("online_list_form") ||
  currentURL.includes("online_time_view_form")
) {
  console.log(
    "URL contains 'online_list_form' or 'online_time_view_form'. Executing handleNewPage..."
  );
  handleNewPage();
}

// URL에 'online_view_form'이 포함된 경우 강의 자동 재생 처리
else if (currentURL.includes("online_view_form")) {
  console.log(
    "URL contains 'online_view_form'. Executing video playback automation..."
  );
  handleVideoPlaybackInIframe();
}

function startAutomation() {
  console.log("Automation started in Content Script!");

  // Step 1: message_item이라는 class를 가지고 Todo List라는 title을 가진 요소를 찾음
  const todoListButton = Array.from(
    document.getElementsByClassName("message_item")
  ).find((item) => item.getAttribute("title") === "Todo List");

  if (todoListButton) {
    todoListButton.click();
    console.log("Todo List button clicked.");

    // Step 2: todo_list_wrap 클래스 이름을 가진 요소가 로드될 때까지 기다림
    const observer = new MutationObserver((mutations, observerInstance) => {
      const todoWrap = document.getElementsByClassName("todo_list_wrap");
      if (todoWrap && todoWrap.length > 0) {
        observerInstance.disconnect();
        proceedWithTodoList();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.log("Todo List not found.");
  }
}

// Step 1: 강의 목록을 처리하는 함수
function proceedWithTodoList() {
  console.log("Processing todo list...");

  const onlineLectureButton = Array.from(
    document.getElementsByClassName("todo_category")
  ).find((item) => item.getAttribute("data") === "lecture_weeks");

  if (onlineLectureButton) {
    onlineLectureButton.click();
    console.log("Online Lecture button clicked.");

    // 2초 정도 기다린 후 나머지 코드 실행
    setTimeout(() => {
      console.log("Waited for 2 seconds after clicking.");

      // todo_wrap 클래스 중 on 클래스가 함께 있는 요소들만 필터링
      const wholeTodoItems = Array.from(
        document.getElementsByClassName("todo_wrap")
      ).filter((item) => item.classList.contains("on"));

      if (wholeTodoItems.length > 0) {
        wholeTodoItems[0].click();
        console.log("First lecture item with 'on' class clicked.");
      } else {
        console.log("No online lecture items with 'on' class found.");
      }
    }, 2000); // 2초 대기 (2000ms)
  } else {
    console.log("Online lecture category not found.");
  }
}

// Step 2: 새로운 페이지에서 실행할 작업
function handleNewPage() {
  console.log("Handling new page...");
  setTimeout(() => {
    const perTextElements = Array.from(
      document.querySelectorAll("#per_text")
    ).filter((element) => element.textContent.trim() !== "100%");

    if (perTextElements.length > 0) {
      const timeElements = perTextElements.map((el) => {
        const timeText = el.nextElementSibling?.textContent.split(" / ")[2];
        return { element: el, timeText };
      });

      const firstTimeElement = timeElements[0];
      firstTimeElement.element
        .closest("div")
        .parentElement.previousElementSibling.querySelector(
          ".site-mouseover-color"
        )
        .click();
      console.log("First incomplete lecture clicked.");
    } else {
      console.log("All lectures are complete.");
      window.location.href = "http://ecampus.konkuk.ac.kr/";
    }
  }, 1000);
}

function handleVideoPlaybackInIframe() {
  console.log("Handling video playback inside iframe...");

  // MutationObserver로 contentViewer iframe이 로드될 때까지 기다림
  const observer = new MutationObserver((mutations, observerInstance) => {
    const iframe = document.getElementById("contentViewer");

    if (iframe) {
      console.log("Iframe found!");

      // iframe이 로드되면 그 안에 있는 비디오를 제어
      iframe.addEventListener("load", () => {
        console.log("Iframe loaded.");

        // iframe 내부의 문서에 접근
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow.document;
        const videoElement = iframeDocument.querySelector("video");

        if (videoElement) {
          console.log("Video element found inside iframe!");

          // 비디오 재생/일시정지 토글
          toggleVideoPlayback(videoElement);

          // observer 중지
          observerInstance.disconnect();
        } else {
          console.log("Video element not found inside iframe.");
        }
      });
    }
  });

  // DOM 변화를 감지할 대상 설정
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // 페이지에 이미 iframe이 있을 수 있으므로 즉시 확인
  const iframe = document.getElementById("contentViewer");
  if (iframe) {
    console.log("Iframe found initially!");

    // iframe이 이미 로드된 경우 바로 로직 실행

    const loadEv = () => {
      console.log("Iframe loaded.");
      const iframeSrc = iframe.src;
      console.log("Iframe loaded with src:", iframeSrc);
      if (iframeSrc.includes("youtube.com") || iframeSrc.includes("youtu.be")) {
        console.log("YouTube video detected.");

        // YouTube autoplay, controls hidden, mute 등의 설정 추가
        let newSrc = iframeSrc + "?autoplay=1&mute=1&controls=0";
        iframe.src = newSrc;

        // 5초 후 창 닫기
        setTimeout(() => {
          const closeButton = document.getElementById("close_");
          if (closeButton) {
            closeButton.click();
            console.log("Close button clicked. Exiting video.");
          }
        }, 5000); // 5초 대기 후 창 닫기
        return;
      }
      // iframe 내부의 문서에 접근
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const videoElement = iframeDocument.querySelector("video");

      if (videoElement) {
        console.log("Video element found inside iframe!");

        // 비디오 재생/일시정지 토글
        toggleVideoPlayback(videoElement);

        // observer 중지
        observer.disconnect();
      } else {
        console.log("Video element not found inside iframe.");
      }
      iframe.removeEventListener("load", loadEv);
    };
    iframe.addEventListener("load", loadEv);
  }
}

// 비디오 재생/일시정지 토글 함수
function toggleVideoPlayback(videoElement) {
  // 비디오가 재생 중이면 일시정지, 일시정지 중이면 재생
  videoElement.muted = true;
  if (videoElement.paused) {
    setTimeout(() => {
      videoElement.play();
      console.log("Video is now playing.");
    }, 2000);
  } else {
    videoElement.pause();
    console.log("Video is now paused.");
  }

  // 비디오 종료 시점 대기 로직 시작
  waitForVideoToEnd(videoElement);
}

// 비디오가 끝날 때까지 기다린 후 5초 대기 후 닫기
function waitForVideoToEnd(videoElement) {
  const waitForVideoToEndInterval = setInterval(() => {
    const currentTime = videoElement.currentTime;
    const duration = videoElement.duration;

    console.log(`Current time: ${currentTime}, Duration: ${duration}`);

    if (currentTime >= duration && currentTime !== 0) {
      console.log("Video reached the end. Waiting 5 more seconds...");

      clearInterval(waitForVideoToEndInterval);

      // 5초 대기 후 창 닫기
      setTimeout(() => {
        const closeButton = document.getElementById("close_");
        if (closeButton) {
          closeButton.click();
          console.log("Close button clicked. Exiting video.");
        }
      }, 5000); // 5초 대기
    }
  }, 1000); // 1초 간격으로 비디오 상태 체크
}
