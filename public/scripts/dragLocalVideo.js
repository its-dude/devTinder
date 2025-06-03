function drag(block) {
    let isMouseDown = false;
    let offsetX = 0;
    let offsetY = 0;

    block.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isMouseDown = true;

        const rect = block.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        console.log("mouse down", isMouseDown);
    });

    document.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            block.style.position = 'absolute';
            block.style.left = x + 'px';
            block.style.top = y + 'px';

            console.log("moving", x, y);
        }
        console.log("normal moving");
    });

    document.addEventListener('mouseup', (e) => {
        if (isMouseDown) {
            isMouseDown = false;
            console.log("mouse up", isMouseDown);
        }
    });
}
