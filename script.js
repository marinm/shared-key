const currentScreenId = "screen-code-input";
const CODE_LENGTH = 8;
const ownCode = randomCode();
const friendCode = Array(CODE_LENGTH).fill(" ");
let focusPosition = 0;

renderOwnCode();
renderFriendCode();
renderFocus();
showScreen("screen-code-input");

function showScreen(screenId) {
    document
        .querySelectorAll(".screen")
        .forEach((el) => el.classList.add("hidden"));

	const delay = (screenId === currentScreenId) ? 0 : 200;

	setTimeout(() => {
		document.getElementById(screenId).classList.remove("hidden");
	}, delay);
}

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
    const digits = document.querySelectorAll("#friend-code .digit");

    digits.forEach((element) => {
        element.classList.remove("focus");
    });

    const focusDigit = Array.from(digits).find(
        (el) => el.dataset.position == String(focusPosition)
    );

    focusDigit.classList.add("focus");
}

function renderFriendCode() {
    friendCode.forEach((value, index) => {
        const digit = document.querySelector(
            `#friend-code .digit[data-position="${index}"]`
        );

        if (digit) {
            digit.innerHTML = value;
        }
    });
}

document.querySelectorAll("#friend-code .digit").forEach((element) => {
    element.addEventListener("click", (event) => {
        focusPosition = Number(event.target.dataset.position);
        renderFocus();
    });
});

document.querySelectorAll(".keypad-btn").forEach((element) => {
    element.addEventListener("click", (event) => {
        friendCode[focusPosition] = event.target.dataset.value;

        focusPosition =
            focusPosition < CODE_LENGTH - 1 ? focusPosition + 1 : focusPosition;

        renderFriendCode();
        renderFocus();
    });
});

document.getElementById("connect-btn").addEventListener("click", (event) => {
    showScreen("screen-waiting");
});

function randomCode() {
    const array = new Uint32Array(1);
    self.crypto.getRandomValues(array);
    return String(array[0]).padStart(10, "0").slice(-CODE_LENGTH);
}
