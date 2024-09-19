document.getElementById("start").addEventListener("click", () => {
  // 현재 활성화된 탭에서 content.js 파일을 실행
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        files: ["content.js"], // content.js 파일을 실행
      },
      () => {
        console.log("Content script executed.");
      }
    );
  });
});
