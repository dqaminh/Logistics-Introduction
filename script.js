"use strict";

// The shy button stays inside its playground, above the link to page 2.
const runaway = document.querySelector("#runaway-button");
const playground = document.querySelector("#playground");
const nextPage = document.querySelector("#next-page");
const hint = document.querySelector("#runaway-hint");

if (runaway && playground && nextPage && hint) {
  let lastMove = -Infinity;
  let escapes = 0;

  function escape(event) {
    if (event.type === "pointerdown" || event.type === "click") event.preventDefault();
    // One physical tap can produce both pointerdown and click. Move only once.
    if (performance.now() - lastMove < 180) return;

    const area = playground.getBoundingClientRect();
    const button = runaway.getBoundingClientRect();
    const link = nextPage.getBoundingClientRect();
    const padding = 4;
    const maxX = Math.max(padding, area.width - button.width - padding);
    const maxY = Math.max(padding, link.top - area.top - button.height - 16);
    const oldX = button.left - area.left;
    const oldY = button.top - area.top;
    const pointerX = Number.isFinite(event.clientX) && event.clientX !== 0 ? event.clientX - area.left : oldX + button.width / 2;
    const pointerY = Number.isFinite(event.clientY) && event.clientY !== 0 ? event.clientY - area.top : oldY + button.height / 2;

    const candidates = [
      { x: padding, y: padding }, { x: maxX, y: padding },
      { x: padding, y: maxY }, { x: maxX, y: maxY }
    ];
    for (let i = 0; i < 16; i++) {
      candidates.push({ x: padding + Math.random() * (maxX - padding), y: padding + Math.random() * (maxY - padding) });
    }
    // Choose a spot away from both her finger/cursor and the previous position.
    const score = spot => Math.hypot(spot.x - oldX, spot.y - oldY)
      + Math.hypot(spot.x + button.width / 2 - pointerX, spot.y + button.height / 2 - pointerY) * .7;
    const destination = candidates.reduce((best, spot) => score(spot) > score(best) ? spot : best);

    runaway.classList.add("has-moved");
    // CSS also clamps the position while a resize event is still pending.
    runaway.style.left = `clamp(4px, ${destination.x}px, calc(100% - ${button.width}px - 4px))`;
    runaway.style.top = `${destination.y}px`;
    lastMove = performance.now();
    escapes++;
    const messages = [
      "Ơ kìa… nút này biết chạy nè! ☺",
      "Bắt được anh rồi hãy bấm nha ♡",
      "Hình như nút này cũng đang ngại em đó…",
      "Thôi mà, chọn nút hồng thử đi em ♡"
    ];
    hint.textContent = messages[Math.min(escapes - 1, messages.length - 1)];
  }

  runaway.addEventListener("pointerenter", event => {
    if (event.pointerType === "mouse") escape(event);
  });
  runaway.addEventListener("pointerdown", escape);
  // Native button clicks also support Enter/Space and assistive technology.
  runaway.addEventListener("click", escape);

  function resetPosition() {
    runaway.classList.remove("has-moved");
    runaway.style.removeProperty("left");
    runaway.style.removeProperty("top");
  }
  // Reset after resizing/phone rotation so the button cannot end up offscreen.
  window.addEventListener("resize", resetPosition);
  if ("ResizeObserver" in window) new ResizeObserver(resetPosition).observe(playground);
}
