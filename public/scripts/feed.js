let count = 0;
const limit = 2;

async function getUsers(page) {
    try {
        const response = await fetch(`/user/feed?page=${page || 1}&limit=${limit}`);
        return await response.json(); // Return users instead of storing them globally
    } catch (error) {
        console.log(error);
        return []; // Return an empty array to prevent crashes
    }
}

async function main() {
    let page = 1;
    let users = await getUsers(page); // Fetch users inside `main()`
    console.log(users);
    let user = users[count];

    async function fetchUser() {

        if (count >= users.length) {
            page++;
            users = await getUsers(page);
            count = 0;
            console.log(limit, users);
            if (users.length === 0) {
                document.getElementById('container').style.opacity = '0';
                document.getElementById('no-users').style.opacity = '1';
                return;
            }
        }

        user = users[count];
        document.getElementById('firstName').innerText = users[count].firstName;
        document.getElementById('lastName').innerText = users[count].lastName;
        document.getElementById('gender').innerText = users[count].gender;
        document.getElementById('age').innerText = users[count].age;
        document.getElementById('photo').querySelector('img').src = users[count].photoUrl;
        count++;
       
    }

    async function interested(currentUser) {
        try {
            const sendRequest = await fetch(`/request/send/interested/${currentUser._id}`, {
                method: "POST", // Specify the request method
                headers: {
                    "Content-Type": "application/json" // Optional: Include only if required by the server
                }
            });
            console.log("successfull")
            fetchUser();
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    async function ignore(currentUser) {
        try {
            const sendRequest = await fetch(`/request/send/ignore/${currentUser._id}`, {
                method: "POST", // Specify the request method
                headers: {
                    "Content-Type": "application/json" // Optional: Include only if required by the server
                }
            });
            console.log("Request successful!");
            fetchUser();
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    // Initialize the first user
    fetchUser();

    // Attach `interested` function to the button
    document.getElementById("interested-btn").addEventListener("click", function () {
        interested(user);
    });
    // Attach `ignore` function to the button
    document.getElementById("ignore-btn").addEventListener("click", function () {
        ignore(user);
    });

}

main();
