document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();
    
    const emailId = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const messageElement = document.getElementById("message");

    if (!emailId || !password) {
        messageElement.innerText = "All fields are required!";
        messageElement.style.color = "red";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ emailId, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.innerText = "Login Successful!";
            messageElement.style.color = "green";

            // Redirect to profile or dashboard page after login
            setTimeout(() => {
                window.location.href = "/profile";
            }, 1000);
        } else {
            messageElement.innerText = data.error || "Invalid Credentials!";
            messageElement.style.color = "red";
        }
    } catch (error) {
        console.error("Error:", error);
        messageElement.innerText = "Something went wrong!";
        messageElement.style.color = "red";
    }
});
