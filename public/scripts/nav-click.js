function main() {
    const routes = document.querySelector('.user-block');
    const profile = document.getElementById('profile');

    // Toggle opacity on profile click
    profile.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents click from bubbling to `document`
        routes.style.opacity = routes.style.opacity === '1' ? '0' : '1';
    });

    // Hide `.user-block` when clicking anywhere else
    document.addEventListener('click', (event) => {
        if (!routes.contains(event.target) && event.target !== profile) {
            routes.style.opacity = '0';
        }
    });
}

main();
