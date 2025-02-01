export function randomCode(n) {
    // one unsigned 32-bit number has the range [0, 4,294,967,296 - 1]
    // Can provide 8 digits

    const nInts = parseInt(Math.ceil(n / 8));
    const array = new Uint32Array(nInts);
    self.crypto.getRandomValues(array);

    return array
        .map((num) => num.toString().padStart(8, "0"))
        .join("")
        .slice(0, n);
}