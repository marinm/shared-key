const codeLength = 8;

const code = new Array(codeLength);
let focusPosition = 0;

renderFocus();

function renderFocus() {
    const digits = document.querySelectorAll(".digit");

    digits.forEach((element) => {
        element.classList.remove("focus");
    });

    const focusDigit = Array.from(digits).find(
        (el) => el.dataset.position == String(focusPosition)
    );

    focusDigit.classList.add("focus");
}

function renderCode() {
    code.forEach((value, index) => {
        const digit = document.querySelector(
            `.digit[data-position="${index}"]`
        );

        if (digit) {
            digit.innerHTML = value;
        }
    });
}

document.querySelectorAll(".digit").forEach((element) => {
    element.addEventListener("click", (event) => {
        focusPosition = Number(event.target.dataset.position);
        renderFocus();
    });
});

document.querySelectorAll(".keypad-btn").forEach((element) => {
    element.addEventListener("click", (event) => {
        code[focusPosition] = event.target.dataset.value;

        focusPosition =
            focusPosition < codeLength - 1 ? focusPosition + 1 : focusPosition;

        renderCode();
        renderFocus();
    });
});
