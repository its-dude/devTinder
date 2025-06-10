function main() {

        document.addEventListener('click',(e)=>{
            e.stopPropagation();
            const routes = document.querySelector('.user-block');
            const profile = document.getElementById('profile');

            if (e.target.contains(profile)) { 
                routes.style.display = routes.style.display === 'none' ? 'flex' : 'none';
            }

            if (!routes.contains(e.target) && e.target !== profile) {
                routes.style.opacity = '0';
            }

        })

}

main();
