// check-benefits.js

import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";

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
      siteLink:"https://www.seoulmomcare.com/notice/businessGuide.do",
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
      siteLink:"https://seoul-agi.seoul.go.kr/postpartum-care",
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
      siteLink: "https://www.bokjiro.go.kr/ssis-tbu/twataa/wlfareInfo/moveTWAT52011M.do?wlfareInfoId=WLF00001361&wlfareInfoReldBztpCd=02",
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
      siteLink: "http://www.voucher.go.kr/voucher/firstEncounter.do",
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
      siteLink: "https://www.busan.go.kr/childcare/childcare0602",
    },
  },
];


const resultsSection = document.getElementById("results-section");
const matchedBenefitsContainer = document.getElementById("matched-benefits");
let upperText = document.getElementById("upper-text");

let checkingBenefit = [];
const matchedBenefits = [];

// 유저 혜택 DB에서 불러오기
async function getUserBenefits() {
  const user = auth.currentUser;
  if (!user) return [];

  const userId = user.uid;
  const ref = doc(db, "profiles", userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    checkingBenefit = snap.data().checkingBenefit || [];
    return checkingBenefit;
  } else {
    return [];
  }
}

// 체크박스 변경 시 DB 자동 저장
async function saveCheckingBenefitToDB() {
  const user = auth.currentUser;
  if (!user) return;

  const userId = user.uid;
  await setDoc(doc(db, "profiles", userId), { checkingBenefit }, { merge: true });
  console.log("checkingBenefit DB 저장 완료");
}
// 페이지 열리자마자 실행
document.addEventListener("DOMContentLoaded", async () => {
  // 유저 혜택 가져오기
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await getUserBenefits();
        renderUserBenefits();
      }
      resolve();
      unsubscribe();
    });
  });
});

// 모든 혜택 렌더링
function renderUserBenefits() {
  matchedBenefitsContainer.innerHTML = "";

  const matchedIds = checkBenefitMatch();
  const matched = checkAppliedMatch(matchedIds);



  if(matched.length > 0){
    matched.forEach(benefit => {
      const benefitEl = document.createElement("div");
      benefitEl.className = "p-5 bg-white border border-green-300 rounded-lg shadow-md transition-all hover:shadow-lg";
      benefitEl.innerHTML = `
        <h4 class="font-bold text-lg text-green-700">${benefit.title}</h4>
        <p class="text-sm text-gray-600 mt-1">${benefit.description}</p>
        <button class="text-sm text-white bg-green-600 px-3 py-1 rounded-full mt-3 hover:bg-green-700" onclick="location.href='${benefit.criteria.siteLink}'">자세한 정보 보기</button>
        <label class="flex items-center gap-2 mt-3">
          <input type="checkbox" class="benefit-check" ${benefit.applied ? "" : "checked"}>
          <span class="text-sm text-gray-700">신청완료!</span>
        </label>
      `;
      matchedBenefitsContainer.appendChild(benefitEl);

      const checkbox = benefitEl.querySelector(".benefit-check");
      checkbox.addEventListener("change", async () => {
        const target = checkingBenefit.find(b => b.id === benefit.id);
        if (target) {
          target.applied = checkbox.checked;
        } else {
          checkingBenefit.push({ id: benefit.id, applied: checkbox.checked });
        }
        await saveCheckingBenefitToDB();
      });
    });}else{
      matchedBenefitsContainer.innerHTML = `
              <div class="p-4 bg-white border border-gray-300 rounded-lg shadow">
                  <h4 class="font-bold text-lg">결과가 없습니다</h4>
                  <p class="text-sm text-gray-600">입력하신 조건에 맞는 혜택을 찾지 못했습니다. <br>다른 혜택을 확인해보세요.</p>
              </div>
          `;
      upperText.textContent = "❌ 수혜 받으신 혜택이 없어요!";
      upperText.className = "text-xl font-semibold text-red-600 mb-4"
    }

  resultsSection.classList.remove("hidden");
}

// 조건 체크 함수
function checkBenefitMatch() {
  const matched = [];
  checkingBenefit.forEach((benefit) => {
    if (benefit.applied === true) {
      matched.push(benefit.id);
    }
  });
  return matched;
}
function checkAppliedMatch(matchedIds) {
  const matched = [];
  for (let i = 0; i < allBenefits.length; i++) {
    if (matchedIds.includes(allBenefits[i].id)) {
      matched.push(allBenefits[i]);
    }
  }
  return matched;
}