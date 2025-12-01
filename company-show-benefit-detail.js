// benefit-detail.js
// allCompanyBenefits 데이터가 필요하므로 동일 데이터 파일을 import하거나 별도 JS에 정의
// 예시로 간단히 같은 구조로 정의
const allCompanyBenefits = [
  {
    id: 1,
    title: "삼성전자(samsung)",
    mainDescription: "결혼 및 임산부 대상으로의 적절한 혜택.",
    subDescription: `임신 및 출산 관련 혜택

<strong>임신기 근로시간 단축:</strong> 임신 기간 전체에 걸쳐 <strong>1일 2시간</strong> 단축 신청이 가능합니다.
<strong>유급 근로시간 단축:</strong> <strong>고위험</strong> 임산부의 경우 임신 전기간에 유급으로 근로시간 단축을 사용할 수 있습니다.
<strong>배우자 출산휴가:</strong> 법정 기준(10일)보다 긴 <strong>15</strong>일의 유급 휴가가 제공됩니다. (다태아의 경우 20일)
<strong>난임 휴가:</strong> <strong>총 6일</strong>의 난임 휴가가 제공됩니다. (유급 5일, 무급 1일)
<strong>출산축하금:</strong> 첫째 <strong>30</strong>만 원, 둘째 <strong>50</strong>만 원, 셋째 <strong>100</strong>만 원을 지급합니다. 

<strong>기타 복지 혜택</strong>
임직원 지원: 임신 및 출산과 관련된 다양한 지원제도 운영됩니다.
유사 복지 혜택: 임신, 출산, 육아 관련 지원 제도 확대 운영합니다.`,
    siteLink: "https://blog.naver.com/sannywoo/223314603213",
    companyColor: "blue-300",
  },
  {
    id: 2,
    title: "기아(kia)",
    mainDescription: "결혼 및 임산부 대상으로의 적절한 혜택.",
    subDescription: `기아 임신 및 출산 주요 혜택

<strong>난임 치료 지원:</strong> <strong>난임 부부</strong> 직원을 위해 횟수 제한 없이 시술비를 지원합니다 (회당 100만 원 한도).
<strong>출산 축하금:</strong> 자녀 출생 시 첫째 <strong>300</strong>만 원, 둘째 <strong>400</strong>만 원, 셋째 이상 <strong>500</strong>만 원의 출산 축하금을 지급합니다.
<strong>배우자 출산 휴가 확대:</strong> 배우자 출산 시 유급 휴가를 기존 10일에서 <strong>20</strong>일로 확대하여 지원합니다.
<strong>임신기 근로시간 단축:</strong> 임신 직원은 임금 삭감 없이 <strong>1일 2시간</strong>의 근로시간 단축 제도를 이용할 수 있으며, 지원 기간이 확대되었습니다.
<strong>육아 휴직 지원:</strong> 자녀 1인당 최대 <strong>2</strong>년의 육아 휴직을 사용할 수 있습니다.
<strong>직장 어린이집 운영:</strong> 전문 위탁 기관에서 운영하는 <strong>직장 어린이집</strong>을 사업장 내에 설치하여 보육을 지원합니다.
<strong>자녀 학자금 지원:</strong> 직원 자녀의 교육비 부담을 덜어주기 위한 <strong>학자금 지원</strong> 제도가 있습니다.
<strong>가족 여행 지원:</strong> 출산 및 육아 부담 경감과 가족 축하를 위해 <strong>가족 여행(2박 3일 숙식비)</strong>을 지원합니다. 

<strong>이 외에도</strong> 기아는 임산부 휴게실, 수유 시설 제공 등 일-가정 양립을 위한 다양한 가족 친화 정책을 시행하고 있습니다`,
    siteLink: "https://blog.naver.com/sannywoo/223314603213",
    companyColor: "red-300",
  },
];

// URL에서 id 가져오기
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

// 해당 id의 혜택 찾기
const benefit = allCompanyBenefits.find(b => b.id === id);

if (benefit) {
  document.getElementById("benefit-title").innerHTML = `<p class="whitespace-pre-line">${benefit.title}</p>`;
  document.getElementById("benefit-title").className = `text-2xl font-bold text-center text-${benefit.companyColor.replace('300','700')} mb-6`;
  document.getElementById("benefit-subDes").innerHTML = `<p class="whitespace-pre-line tracking-wide" ">${benefit.mainDescription}</p>`;
  document.getElementById("benefit-mainDes").innerHTML = `<p class="whitespace-pre-line leading-normal tracking-tighter">${benefit.subDescription}</p>`;
  document.getElementById("benefit-site").textContent = "출처: "+benefit.siteLink;
  document.getElementById("benefit-site").href = benefit.siteLink;
  const linkEl = document.getElementById("benefit-link");
} else {
  document.getElementById("benefit-title").textContent = "존재하지 않는 혜택입니다.";
  document.getElementById("benefit-subDes").textContent = "";
  document.getElementById("benefit-mainDes").textContent = "";
  // document.getElementById("benefit-link").style.display = "none";
}