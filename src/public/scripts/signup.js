document.getElementById("signupForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const formData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        emailId: document.getElementById("emailId").value,
        password: document.getElementById("password").value,
        gender: document.getElementById("gender").value,
        skills: document.getElementById("skills").value,
        age: document.getElementById("age").value,
        about: document.getElementById("about").value
    };
    if(document.getElementById("photoUrl").value)formData.photoUrl=document.getElementById("photoUrl").value;
    
    try {
        const response = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            window.location.href = "/login";
        } else {
            document.getElementById("error-message").textContent = result.error || "Signup failed. Please try again.";
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("error-message").textContent = "An error occurred. Please try again later.";
    }
});
