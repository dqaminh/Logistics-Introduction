"use strict";

// Each shy button stays inside its playground, above its fixed action.
function setupRunaway(runaway, playground, nextPage, hint, messages) {
  if (!runaway || !playground || !nextPage || !hint) return;
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
    hint.textContent = messages
      ? messages[Math.min(escapes - 1, messages.length - 1)]
      : `Nút đã di chuyển ${escapes} lần.`;
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

setupRunaway(
  document.querySelector("#runaway-button"),
  document.querySelector("#playground"),
  document.querySelector("#next-page"),
  document.querySelector("#runaway-hint"),
  [
    "Ơ kìa… nút này biết chạy nè! ☺",
    "Bắt được anh rồi hãy bấm nha ♡",
    "Hình như nút này cũng đang ngại em đó…",
    "Thôi mà, chọn nút hồng thử đi em ♡"
  ]
);

setupRunaway(
  document.querySelector("#invitation-runaway"),
  document.querySelector("#invitation-playground"),
  document.querySelector("#accept-invitation"),
  document.querySelector("#invitation-status")
);

const continueButton = document.querySelector("#continue-button");
if (continueButton) {
  continueButton.addEventListener("click", () => {
    document.querySelector("#apology-step").hidden = true;
    document.querySelector("#invitation-step").hidden = false;
    document.querySelector(".second-letter").setAttribute("aria-labelledby", "invitation-title");
    document.querySelector("#invitation-title").focus({ preventScroll: true });
  });
}
