"use client";

export default function GeoAutofillButton() {
  function autofill() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const latInput = document.querySelector<HTMLInputElement>('input[name="lat"]');
      const lngInput = document.querySelector<HTMLInputElement>('input[name="lng"]');
      if (latInput && lngInput) {
        latInput.value = String(pos.coords.latitude);
        lngInput.value = String(pos.coords.longitude);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={autofill}
      className="w-full px-4 py-2 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-sm cursor-pointer hover:bg-neutral-300 dark:hover:bg-neutral-700 transition"
    >
      Use my current location
    </button>
  );
}


