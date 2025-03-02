
async function fetchdata(){
let data = await fetch('/profile/user');
const profileData = await data.json();

document.getElementById("profile-img").src = profileData.photoUrl;
document.getElementById("profile-name").textContent = `${profileData.firstName} ${profileData.lastName}`;
document.getElementById("profile-email").textContent = profileData.emailId;
document.getElementById("profile-gender").textContent = profileData.gender;
document.getElementById("profile-age").textContent = profileData.age;
document.getElementById("profile-about").textContent = profileData.about;

const skillsContainer = document.getElementById("profile-skills");
profileData.skills.forEach(skill => {
    const skillElement = document.createElement("span");
    skillElement.className = "skill";
    skillElement.textContent = skill;
    skillsContainer.appendChild(skillElement);
});

}

fetchdata();