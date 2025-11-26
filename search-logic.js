// search-logic.js

// ---  알고리즘 구현 ---

// 1. 혜택 데이터베이스 (DB 대신 임시 데이터)
// 실제로는 서버에서 가져와야 할 데이터
const allBenefits = [
  {
    id: 1,
    title: "청년 임산부 특별 지원 (예시)",
    description:
      "만 20세 이상 30세 이하, 소득 2분위 이하(1, 2분위) 청년 임산부 대상.",
    // 20세 이상 30세 이하, 소득 3분위 이상(1, 2분위) [cite: 21] (자료의 '3분위 이상'은 '3분위 미만'의 오타로 판단, 1,2분위를 의미)
    criteria: {
      minAge: 20,
      maxAge: 30,
      maxIncomeBracket: 2, // 1, 2분위만 해당
      region: null,
      minChildren: 0,
      worth: 10,
      siteLink:"https://www.seoulmomcare.com/notice/businessGuide.do"
    },
  },
  {
    id: 2,
    title: "서울형 산후조리 경비 지원",
    description: "서울시 거주, 6개월 이상 거주한 산모. 소득 기준 없음.",
    criteria: {
      minAge: null,
      maxAge: null,
      maxIncomeBracket: null, // 소득 무관
      region: "서울",
      minChildren: 1,
      worth: 10,
      siteLink:"https://seoul-agi.seoul.go.kr/postpartum-care"
    },
  },
  {
    id: 3,
    title: "경기도 산후조리비 지원",
    description: "경기도 거주, 출생일 기준 1년 이상 거주. 소득 7분위 이하.",
    criteria: {
      minAge: null,
      maxAge: null,
      maxIncomeBracket: 7, // 1~7분위
      region: "경기",
      minChildren: 1,
      worth: 10,
      siteLink: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001361&wlfareInfoReldBztpCd=02"
    },
  },
  {
    id: 4,
    title: "첫만남이용권 (전국 공통)",
    description: "출생아 1인당 200만원 바우처 지급. 지역/소득 무관.",
    criteria: {
      minAge: null,
      maxAge: null,
      maxIncomeBracket: null,
      region: null,
      minChildren: 1,
      worth: 10,
      siteLink: "http://www.voucher.go.kr/voucher/firstEncounter.do"
    },
  },
  {
    id: 5,
    title: "다자녀 특별 혜택 (부산)",
    description: "부산 거주, 자녀 2명 이상, 소득 8분위 이하 가정.",
    criteria: {
      minAge: null,
      maxAge: null,
      maxIncomeBracket: 8,
      region: "부산",
      minChildren: 2, // 자녀 2명 '이상'
      worth: 10,
      siteLink: "https://www.busan.go.kr/childcare/childcare0602"
    },
  },
];

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
    if (checkBenefitMatch(user, benefit.criteria)) {
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
function checkBenefitMatch(user, criteria) {
  // 나이 검사 (minAge)
  if (criteria.minAge !== null && user.age < criteria.minAge) {
    return false;
  }
  // 나이 검사 (maxAge)
  if (criteria.maxAge !== null && user.age > criteria.maxAge) {
    return false;
  }
  // 소득분위 검사 (maxIncomeBracket: max 수치보다 *작거나 같아야* 함)
  if (
    criteria.maxIncomeBracket !== null &&
    user.incomeBracket > criteria.maxIncomeBracket
  ) {
    // 예: 기준 2분위(1,2) -> 유저 4분위 -> 탈락 (4 > 2) [cite: 22]
    // 예: 기준 2분위(1,2) -> 유저 2분위 -> 통과 (2 > 2 아님) [cite: 24]
    return false;
  }
  // 지역 검사
  if (criteria.region !== null && user.region !== criteria.region) {
    return false;
  }
  // 자녀 수 검사 (minChildren)
  if (
    criteria.minChildren !== null &&
    user.children < criteria.minChildren
  ) {
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
                  <h4 class="font-bold text-lg text-green-700">${benefit.criteria.worth} 만원</h4>
                  <button class="text-sm text-white bg-green-600 px-3 py-1 rounded-full mt-3 hover:bg-green-700" onclick="location.href='./login.html'">
                      신청하기 (연동예정)
                  </button>
              `;
      matchedBenefitsContainer.appendChild(benefitEl);
    }); // <h4 class="font-bold text-lg text-green-700">${benefit.title}</h4>
                  // <p class="text-sm text-gray-600 mt-1">${benefit.description}</p>
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