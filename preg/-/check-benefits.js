// search-logic.js

// ---  알고리즘 구현 ---

// 1. 혜택 데이터베이스 (DB 대신 임시 데이터)
// 실제로는 서버에서 가져와야 할 데이터
import {allBenefits} from "./search-logic-logined.js"

// 2. DOM 요소 선택
const infoForm = document.getElementById("info-form");
const resultsSection = document.getElementById("results-section");
const matchedBenefitsContainer = document.getElementById("matched-benefits");
const unmatchedBenefitsContainer = document.getElementById("unmatched-benefits");

// 3. 폼 제출 이벤트 리스너
infoForm.addEventListener("submit", function (event) {
  event.preventDefault(); // 폼 기본 제출 방지

  // 4. 사용자 입력 값 가져오기
  const user = {
    age: parseInt(document.getElementById("age").value),
    incomeBracket: parseInt(document.getElementById("income-bracket").value),
    region: document.getElementById("region").value, // 활성화된 지역 값
    children: parseInt(document.getElementById("children").value),
  };

  // 5. 혜택 필터링
  const matchedBenefits = [];
  const unmatchedBenefits = [];

  allBenefits.forEach((benefit) => {
    if (checkAppliedMatch(user, benefit.criteria)) {
      matchedBenefits.push(benefit);
    } else {
      unmatchedBenefits.push(benefit);
    }
  });

  // 6. 결과 렌더링
  renderResults(matchedBenefits, unmatchedBenefits);

  // 7. 결과 섹션 보여주기
  resultsSection.classList.remove("hidden");
  // 결과 섹션으로 스크롤
  resultsSection.scrollIntoView({ behavior: "smooth" });
});

// 혜택 조건 검사 함수 (자료조사.txt 9Page 로직)
function checkAppliedMatch(user, criteria) {
  // 나이 검사 (minAge)
  if(criteria.applied !== false){
    return false;
  }

  // 모든 조건을 통과하면 true 반환
  return true;
}

// 결과를 HTML로 렌더링하는 함수
function renderResults(matched, unmatched) {
  // 컨테이너 비우기
  matchedBenefitsContainer.innerHTML = "";
  unmatchedBenefitsContainer.innerHTML = "";

  // 수혜 가능한 혜택 렌더링
  if (matched.length > 0) {
    matched.forEach((benefit) => {
      const benefitEl = document.createElement("div");
      benefitEl.className =
        "p-5 bg-white border border-green-300 rounded-lg shadow-md transition-all hover:shadow-lg";
      benefitEl.innerHTML = `
                  
                  <h4 class="font-bold text-lg text-green-700">${benefit.title}</h4>
                  <p class="text-sm text-gray-600 mt-1">${benefit.description}</p>
                  <button class="text-sm text-white bg-green-600 px-3 py-1 rounded-full mt-3 hover:bg-green-700" onclick="location.href='${benefit.criteria.siteLink}'";>
                      자세한 정보 보기
                  </button>
                  <label class="flex items-center gap-2 mt-3">
                    <input type="checkbox" class="benefit-check" ${benefit.applied ? "checked" : ""}>
                    <span class="text-sm text-gray-700">신청완료!</span>
                  </label>
              `;
      matchedBenefitsContainer.appendChild(benefitEl);
      const checkbox = benefitEl.querySelector(".benefit-check");
      checkbox.addEventListener("change", () => {
        benefit.applied = checkbox.checked;
      });
    }); 
  } else {
    // 매칭된 혜택이 없을 경우
    matchedBenefitsContainer.innerHTML = `
              <div class="p-4 bg-white border border-gray-300 rounded-lg shadow">
                  <h4 class="font-bold text-lg">결과가 없습니다</h4>
                  <p class="text-sm text-gray-600">입력하신 조건에 맞는 혜택을 찾지 못했습니다. <br>다른 혜택을 확인해보세요.</p>
              </div>
          `;
  }

  // 기타 혜택 렌더링
  if (unmatched.length > 0) {
    unmatched.forEach((benefit) => {
      const benefitEl = document.createElement("div");
      benefitEl.className =
        "p-4 bg-gray-100 border border-gray-200 rounded-lg";
      benefitEl.innerHTML = `
                  <h4 class="font-semibold text-gray-800">${benefit.title}</h4>
                  <p class="text-xs text-gray-500 mt-1">${benefit.description}</p>
              `;
      unmatchedBenefitsContainer.appendChild(benefitEl);
    });
  }
}