let count = 4;

async function getUsers(page) {
    try {
        const response = await fetch(`/user/feed?page=${page || 1}&limit=10`);
        return await response.json(); // Return users instead of storing them globally
    } catch (error) {
        console.log(error);
        return []; // Return an empty array to prevent crashes
    }
}

async function main() {
    const users = await getUsers(); // Fetch users inside `main()`

    function interested() {
        count++;
        
        // Ensure count does not exceed the users array length
        if (count >= users.length) {
            count = 0; // Reset to loop from start
        }

        document.getElementById('firstName').innerText = users[count].firstName;
        document.getElementById('lastName').innerText = users[count].lastName;
        document.getElementById('gender').innerText = users[count].gender;
        document.getElementById('age').innerText = users[count].age;
        document.getElementById('photo').querySelector('img').src = users[count].photoUrl;
    }

    // Initialize the first user
    interested();

    // Attach `interested` function to the button
    document.getElementById("interested-btn").addEventListener("click", interested);
}

main();
