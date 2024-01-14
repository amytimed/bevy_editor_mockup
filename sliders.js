const sliders = document.querySelectorAll(".slider");
sliders.forEach((slider) => {
    let suffix = slider.dataset.suffix || "";
    let min = parseFloat(slider.dataset.min) || 0;
    let max = parseFloat(slider.dataset.max) || 100;
    let step = parseFloat(slider.dataset.step) || 1;

    let dragging = false;
    let editMode = false;
    let pointerStartPosX = 0;
    let pointerStartPosY = 0;
    let pointerEndPosX = 0;
    let pointerEndPosY = 0;
    let value = parseFloat(slider.dataset.value) || 64;
    const fill = slider.querySelector(".fill");
    const valueElement = slider.querySelector(".value");
    slider.addEventListener("mousedown", (e) => {
        // if it wasnt on a .edit
        if (e.target.classList.contains("edit")) {
            return;
        }
        dragging = true;
        pointerStartPosX = e.pageX;
        pointerStartPosY = e.pageY;
        pointerEndPosX = e.pageX;
        pointerEndPosY = e.pageY;
        // cursor lock api
        // https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API
        slider.requestPointerLock();
    });
    document.addEventListener("mouseup", () => {
        if (dragging) {
            // if its at the same position, it was a click, we should enter edit mode
            if (pointerStartPosX === pointerEndPosX && pointerStartPosY === pointerEndPosY) {
                editMode = true;
                let input = document.createElement("input");
                input.type = "text";
                input.value = value.toFixed(2);
                input.className = "edit";

                function documentMouseDownEventHandle(e) {
                    // if it was in the input, return
                    if (e.target === input) {
                        return;
                    }
                    editMode = false;
                    input.remove();
                    document.removeEventListener("mousedown", documentMouseDownEventHandle);
                    document.removeEventListener("keydown", documentKeyDownEventHandle);
                }

                document.addEventListener("mousedown", documentMouseDownEventHandle);

                // when we leave the input, we should exit edit mode
                input.addEventListener("blur", () => {
                    editMode = false;
                    input.remove();
                    document.removeEventListener("mousedown", documentMouseDownEventHandle);
                });

                // when we press enter, we should exit edit mode
                function documentKeyDownEventHandle(e) {
                    if (e.key === "Enter" || e.key === "Escape") {
                        editMode = false;
                        input.remove();
                        document.removeEventListener("mousedown", documentMouseDownEventHandle);
                        document.removeEventListener("keydown", documentKeyDownEventHandle);
                    }
                }

                document.addEventListener("keydown", documentKeyDownEventHandle);

                // when we change the value, we should update the slider
                input.addEventListener("change", () => {
                    value = input.value;
                    value = Math.max(min, Math.min(max, value));
                    fill.style.width = (value / max) * 100 + "%";
                    valueElement.innerText = value.toFixed(1) + suffix;
                });

                input = slider.appendChild(input);
                input.focus();
                input.select();
            }
        }
        dragging = false;
        // release lock
        document.exitPointerLock();
    });
    document.addEventListener("mousemove", (e) => {
        if (dragging) {
            value += e.movementX * step;
            pointerEndPosX += e.movementX;
            pointerEndPosY += e.movementY;
            // clamp 0-100
            value = Math.max(min, Math.min(max, value));
            fill.style.width = (value / max) * 100 + "%";
            valueElement.innerText = value.toFixed(1) + suffix;
        }
    });

    value = Math.max(min, Math.min(max, value));
    fill.style.width = (value / max) * 100 + "%";
    valueElement.innerText = value.toFixed(1) + suffix;
});