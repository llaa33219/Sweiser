document.addEventListener('DOMContentLoaded', () => {
  const executeCommand = async (command, callback) => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      try {
          const [result] = await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (cmd) => {
                  return new Promise((resolve) => {
                      const checkEntry = () => {
                          if (typeof Entry !== 'undefined') {
                              try {
                                  const value = Function(`"use strict"; ${cmd}`)();
                                  resolve(value);
                              } catch (error) {
                                  resolve({ error: error.message });
                              }
                          } else {
                              setTimeout(checkEntry, 100);
                          }
                      };
                      checkEntry();
                  });
              },
              args: [command],
              world: 'MAIN'
          });

          if (result.result?.error) {
              throw new Error(result.result.error);
          }
          callback(result.result);
      } catch (error) {
          console.error('Error:', error);
          callback(null, error.message);
      }
  };

  // 작품 ID 보기
  document.getElementById('getProjectId').addEventListener('click', () => {
      executeCommand('return Entry.projectId;', (result, error) => {
          const display = document.getElementById('projectResult');
          display.textContent = error || `프로젝트 ID: ${result}`;
      });
  });

  // 초시계 숨기기
  document.getElementById('hideTimer').addEventListener('click', () => {
      executeCommand(`
          Entry.engine.projectTimer.setX(-Number.MAX_VALUE);
          return "초시계가 숨겨졌습니다";
      `, (result) => {
          console.log(result);
      });
  });

  // 대답 숨기기
  document.getElementById('hideAnswer').addEventListener('click', () => {
      executeCommand(`
          Entry.container.inputValue.setX(-Number.MAX_VALUE);
          return "대답 입력창이 숨겨졌습니다";
      `, (result) => {
          console.log(result);
      });
  });

  // FPS 설정
  document.getElementById('fpsApply').addEventListener('click', () => {
      const fpsInput = document.getElementById('fpsInput');
      const fpsValue = parseInt(fpsInput.value);
      
      if (isNaN(fpsValue)) {
          alert('숫자를 입력해주세요!');
          fpsInput.value = '';
          return;
      }

      executeCommand(`
          Entry.FPS = ${fpsValue};
          return "FPS가 ${fpsValue}로 설정됨";
      `, (result) => {
          console.log(result);
          fpsInput.value = '';
      });
  });

  // 신호 길이 변경
  document.getElementById('messageLengthApply').addEventListener('click', () => {
      const input = document.getElementById('messageLengthInput');
      const value = parseInt(input.value);
      
      if (isNaN(value)) {
          alert('숫자를 입력해주세요!');
          input.value = '';
          return;
      }

      executeCommand(`
          EntryStatic.messageMaxLength = ${value};
          return "신호 길이가 ${value}자로 변경됨";
      `, (result) => {
          console.log(result);
          input.value = '';
      });
  });

  // 프레임 속도 보기
  document.getElementById('showFps').addEventListener('click', () => {
      executeCommand('return Entry.FPS;', (result, error) => {
          const display = document.getElementById('fpsResult');
          display.textContent = error || `현재 FPS: ${result}`;
      });
  });

  // 되돌리기 기능 추가
  document.getElementById('undoButton').addEventListener('click', () => {
      const input = document.getElementById('undoSteps');
      let value = parseInt(input.value) || 1; // 기본값 1
  
      executeCommand(`
      Entry.stateManager.undo(${value});
      return "${value}단계 되돌리기 완료";
      `, (result) => {
      console.log(result);
      input.value = '';
      });
  });

  // 장면 추가하기 기능
  document.getElementById('addScene').addEventListener('click', () => {
      executeCommand(`
          try {
              Entry.scene.addScene();
              return "새로운 장면이 추가되었습니다";
          } catch (e) {
              return "장면 추가 중 오류 발생: " + e.message;
          }
      `, (result, error) => {
          const display = document.getElementById('sceneResult');
          display.textContent = error || result;
      });
  });

  // 글상자 폰트 변경 기능
  document.getElementById('changeFontApply').addEventListener('click', () => {
      const fontName = document.getElementById('fontNameInput').value;
      
      if (!fontName) {
          alert('폰트 이름을 입력해주세요!');
          return;
      }

      executeCommand(`
          Entry.playground.object.entity.setFontType('${fontName}');
          return "폰트를 '${fontName}'으로 변경 시도했습니다.";
      `, (result, error) => {
          const display = document.getElementById('fontResult');
          if (error) {
              display.textContent = error;
          } else {
              display.textContent = result;
              document.getElementById('fontNameInput').value = '';
          }
      });
  });

  // 가로 기준점 설정 기능들
  document.getElementById('regXLeft').addEventListener('click', () => {
      executeCommand(`
          Entry.playground.object.entity.regX = 0;
          return "가로 기준점이 좌측으로 설정되었습니다";
      `, (result, error) => {
          const display = document.getElementById('regXResult');
          display.textContent = error || result;
      });
  });

  document.getElementById('regXCenter').addEventListener('click', () => {
      executeCommand(`
          Entry.playground.object.entity.regX = Entry.playground.object.entity.width / 2;
          return "가로 기준점이 중앙으로 설정되었습니다";
      `, (result, error) => {
          const display = document.getElementById('regXResult');
          display.textContent = error || result;
      });
  });

  document.getElementById('regXRight').addEventListener('click', () => {
      executeCommand(`
          Entry.playground.object.entity.regX = Entry.playground.object.entity.width;
          return "가로 기준점이 우측으로 설정되었습니다";
      `, (result, error) => {
          const display = document.getElementById('regXResult');
          display.textContent = error || result;
      });
  });

  // 세로 기준점 설정 기능들
  document.getElementById('regYTop').addEventListener('click', () => {
      executeCommand(`
          Entry.playground.object.entity.regY = 0;
          return "세로 기준점이 상단으로 설정되었습니다";
      `, (result, error) => {
          const display = document.getElementById('regYResult');
          display.textContent = error || result;
      });
  });

  document.getElementById('regYCenter').addEventListener('click', () => {
      executeCommand(`
          Entry.playground.object.entity.regY = Entry.playground.object.entity.height / 2;
          return "세로 기준점이 중앙으로 설정되었습니다";
      `, (result, error) => {
          const display = document.getElementById('regYResult');
          display.textContent = error || result;
      });
  });

  document.getElementById('regYBottom').addEventListener('click', () => {
      executeCommand(`
          Entry.playground.object.entity.regY = Entry.playground.object.entity.height;
          return "세로 기준점이 하단으로 설정되었습니다";
      `, (result, error) => {
          const display = document.getElementById('regYResult');
          display.textContent = error || result;
      });
  });
});