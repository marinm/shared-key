const CODE_LENGTH = 8;
const ownCode = randomCode();
const code = Array(CODE_LENGTH).fill(' ');
let focusPosition = 0;

renderOwnCode();
renderCode();
renderFocus();

function renderOwnCode() {
    [...ownCode].forEach((value, index) => {
        const digit = document.querySelector(
            `#own-code .digit[data-position="${index}"]`
        );

        if (digit) {
            digit.innerHTML = value;
        }
    });
}

function renderFocus() {
    const digits = document.querySelectorAll("#code .digit");

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
            `#code .digit[data-position="${index}"]`
        );

        if (digit) {
            digit.innerHTML = value;
        }
    });
}

document.querySelectorAll("#code .digit").forEach((element) => {
    element.addEventListener("click", (event) => {
        focusPosition = Number(event.target.dataset.position);
        renderFocus();
    });
});

document.querySelectorAll(".keypad-btn").forEach((element) => {
    element.addEventListener("click", (event) => {
        code[focusPosition] = event.target.dataset.value;

        focusPosition =
            focusPosition < CODE_LENGTH - 1 ? focusPosition + 1 : focusPosition;

        renderCode();
        renderFocus();
    });
});

function randomCode() {
    const array = new Uint32Array(1);
    self.crypto.getRandomValues(array);
    return String(array[0]).padStart(10, "0").slice(-CODE_LENGTH);
}
