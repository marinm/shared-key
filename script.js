import { randomCode } from "./randomCode.js";

const SERVER_URL = "https://marinm.net/broadcast";
const tempSharedKeyConnection = null;

const currentScreenId = "screen-code-input";
const CODE_LENGTH = 8;
const SECRET_HALF_LENGTH = 32;
const ownCode = randomCode(CODE_LENGTH).split("");
const friendCode = Array(CODE_LENGTH).fill(" ");
let focusPosition = 0;

const ownId = randomCode(4);
const ownSecretHalf = randomCode(SECRET_HALF_LENGTH);

let friendId = null;
let friendSecretHalf = null;
let friendAck = false;

renderOwnCode();
renderFriendCode();
renderFocus();
showScreen("screen-code-input");

function showScreen(screenId) {
    document
        .querySelectorAll(".screen")
        .forEach((el) => el.classList.add("hidden"));

    const delay = screenId === currentScreenId ? 0 : 200;

    setTimeout(() => {
        document.getElementById(screenId).classList.remove("hidden");
    }, delay);
}

function renderOwnCode() {
    ownCode.forEach((value, index) => {
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
    connect();
});

function validateFriendCode() {
    const isValid = friendCode.every((d) => "0123456789".includes(d));

    if (isValid) {
        return true;
    }

    flashMissingDigits();

    return false;
}

function friendCodeDigitAt(position) {
    return document.querySelector(
        `#friend-code .digit[data-position="${position}"]`
    );
}

function flashMissingDigits() {
    const digits = [...document.querySelectorAll("#friend-code .digit")];

    friendCode.forEach((d, index) => {
        if (!"0123456789".includes(d)) {
            friendCodeDigitAt(index).classList.add("focus");
        }
    });

    const wait = 500;

    setTimeout(() => renderFocus(), wait);
}

function getTempKey() {
    const code1 = friendCode.join("");
    const code2 = ownCode.join("");

    // Smaller key first
    return code1 < code2 ? code1 + code2 : code2 + code1;
}

function connect() {
    if (!validateFriendCode()) {
        return;
    }

    showScreen("screen-waiting");
    tempConnection(getTempKey());
}

function parseJSON(string) {
    try {
        return JSON.parse(string);
    } catch (e) {
		console.log('invalid JSON', string);
	}

    return null;
}

function validateMessage(message) {
    if (!message) {
        return false;
    }

	if (message.my_id?.length != 4) {
		return false;
	}

    if (message.my_secret_half) {
        return (
            String(message.my_secret_half ?? "").length === SECRET_HALF_LENGTH
        );
    }

    if (message.your_id) {
        return String(message.your_id).length === 4;
    }

    return false;
}

function tempConnection(tempKey) {
    const url = `${SERVER_URL}?channel=${tempKey}`;

    const ownSecretPart = randomCode(SECRET_HALF_LENGTH);

    let announceInterval = null;

    const socket = new WebSocket(url);

    socket.onopen = (event) => {
        announceInterval = setInterval(() => {
            socket.send(
                JSON.stringify({
                    my_id: ownId,
                    my_secret_half: ownSecretPart,
                })
            );
        }, 1000);
    };

    socket.onclose = (event) => {
        clearInterval(announceInterval);
    };

    socket.onmessage = (event) => {
        const message = parseJSON(event.data);

        if (!validateMessage(message)) {
			console.log('invalid message', message);
            socket.close();
            return;
        }

		if (message.my_id === ownId) {
            return;
        }

		if (message.my_secret_half) {
			friendId = message.my_id;
			friendSecretHalf = message.my_secret_half;

			socket.send(JSON.stringify({my_id: ownId, your_id: friendId}));
		}

		if (message.your_id === ownId) {
			friendAck = true;
		}

		console.log({ friendId, friendSecretHalf, friendAck });

		if (friendId && friendSecretHalf && friendAck) {
			clearInterval(announceInterval);
			showConnected(message.my_id);
		}
    };
}

function showConnected(friendId) {
    console.log("connected to " + friendId);
    document.getElementById("own-id").innerText = ownId;
    document.getElementById("friend-id").innerText = friendId;
    showScreen("screen-connected");
}
