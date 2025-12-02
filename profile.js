const saveProfileButton = document.getElementById("save-profile");

saveProfileButton.addEventListener("click", async () => {
  const email = getCurrentUserEmail(); // 로그인된 사용자 이메일 가져오기
  const userId = email.replace(/\./g, ',');
  const profileData = {
    age: parseInt(document.getElementById("age").value),
    region: document.getElementById("region").value,
    children: parseInt(document.getElementById("children").value)
  };

  await setDoc(doc(db, "users", userId), profileData, { merge: true });
  console.log("프로필 저장 완료");
});