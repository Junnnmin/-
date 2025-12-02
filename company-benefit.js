const allCompanyBenefits = [
  {
    id: 1,
    title: "삼성전자(samsung)",
    mainDescription: "결혼 및 임산부 대상으로의 적절한 혜택.",
    subDescription: "결혼 시 휴가 5일, 경조사비 200만원, 육아휴직 2년",
    applied: false,
    companyColor: "blue-300",
    siteLink: "https://blog.naver.com/sannywoo/223314603213"
  },
  {
    id: 2,
    title: "기아(kia)",
    mainDescription: "결혼 및 임산부 대상으로의 적절한 혜택.",
    subDescription: "육아휴직 최대 2년, 직장 어린이집 운영, 자동차 할인",
    applied: false,
    companyColor: "red-300",
    siteLink: "https://blog.naver.com/sannywoo/223314603213"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("result-company-benefits");
  const searchInput = document.getElementById("search-benefit-input");

  function render(list = allCompanyBenefits) {
    container.innerHTML = "";
    list.forEach((benefit) => {
      const div = document.createElement("div");
      div.className = `p-5 bg-white border border-${benefit.companyColor} rounded-lg shadow-md w-full max-w-3xl mx-auto`;
      div.innerHTML = `
        <div class="flex justify-between items-start">
          <h4 class="font-bold text-lg text-${benefit.companyColor.replace('300','700')}">${benefit.title}</h4>
          <button class="text-sm text-white bg-green-600 px-3 py-1 rounded hover:bg-green-700"
            onclick="location.href='./company_benefit_detail.html?id=${benefit.id}'">
            자세한 정보 보기
          </button>
        </div>
        <p class="text-sm text-gray-600 mt-1">${benefit.mainDescription}</p>
      `;
      container.appendChild(div);
    });
  }

  // 초기 렌더링
  render();

  // 검색 이벤트
  searchInput.addEventListener("input", (e) => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allCompanyBenefits.filter(b =>
      b.title.toLowerCase().includes(keyword)
    );
    render(filtered);
  });

  document.addEventListener('keydown', function(event){
    if(event.keyCode == 13){
      event.preventDefault();
    };
  }, true);
});