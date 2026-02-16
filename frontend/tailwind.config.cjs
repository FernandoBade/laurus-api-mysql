/** @type {import("tailwindcss").Config} */
module.exports = {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        fontFamily: {
            ui: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
            data: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
            sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        },
        extend: {},
    },
    plugins: [require("daisyui")],
    daisyui: {
        themes: [
            {
                light: {
                    "base-100": "oklch(98% 0.001 106.423)",         //stone-50
                    "base-200": "oklch(97% 0.001 106.424)",         //stone-100
                    "base-300": "oklch(92% 0.003 48.717)",          //stone-200
                    "base-content": "oklch(37% 0.01 67.558)",       //stone-700
                    primary: "oklch(85% 0.138 181.071)",            //teal-300
                    "primary-content": "oklch(37% 0.01 67.558)",    //stone-700
                    secondary: "oklch(92% 0.003 48.717)",           //stone-200
                    "secondary-content": "oklch(37% 0.01 67.558)",  //stone-700
                    accent: "oklch(78% 0.115 274.713)",             //indigo-300
                    "accent-content": "oklch(37% 0.01 67.558)",     //stone-700
                    neutral: "oklch(37% 0.01 67.558)",              //stone-700
                    "neutral-content": "oklch(98% 0.001 106.423)",  //stone-50
                    info: "oklch(86% 0.127 207.078)",               //sky-300
                    "info-content": "oklch(37% 0.01 67.558)",       //stone-700
                    success: "oklch(85% 0.138 181.071)",            //teal-300
                    "success-content": "oklch(37% 0.01 67.558)",    //stone-700
                    warning: "oklch(82% 0.189 84.429)",             //amber-300
                    "warning-content": "oklch(37% 0.01 67.558)",    //stone-700
                    error: "oklch(81% 0.117 11.638)",               //rose-300
                    "error-content": "oklch(37% 0.01 67.558)",      //stone-700
                    "radius-selector": "0.5rem",
                    "radius-field": "1rem",
                    "radius-box": "0.5rem",
                    "size-selector": "0.25rem",
                    "size-field": "0.25rem",
                    border: "1px",
                    depth: "1",
                    noise: "0",
                },
            },
            {
                dark: {
                    "base-100": "oklch(14% 0.004 49.25)",           //stone-950
                    "base-200": "oklch(21% 0.006 56.043)",          //stone-900
                    "base-300": "oklch(26% 0.007 34.298)",          //stone-800
                    "base-content": "oklch(92% 0.003 48.717)",      //stone-200
                    primary: "oklch(85% 0.138 181.071)",            //teal-300
                    "primary-content": "oklch(37% 0.01 67.558)",    //stone-700
                    secondary: "oklch(92% 0.003 48.717)",           //stone-200
                    "secondary-content": "oklch(37% 0.01 67.558)",  //stone-700
                    accent: "oklch(86% 0.127 207.078)",             //sky-300
                    "accent-content": "oklch(37% 0.01 67.558)",     //stone-700
                    neutral: "oklch(37% 0.01 67.558)",              //stone-700
                    "neutral-content": "oklch(92% 0.003 48.717)",   //stone-200
                    info: "oklch(78% 0.115 274.713)",               //indigo-300
                    "info-content": "oklch(37% 0.01 67.558)",       //stone-700
                    success: "oklch(85% 0.138 181.071)",            //teal-300
                    "success-content": "oklch(37% 0.01 67.558)",    //stone-700
                    warning: "oklch(82% 0.189 84.429)",             //amber-300
                    "warning-content": "oklch(37% 0.01 67.558)",    //stone-700
                    error: "oklch(81% 0.117 11.638)",               //rose-300
                    "error-content": "oklch(37% 0.01 67.558)",      //stone-700
                    "radius-selector": "0.5rem",
                    "radius-field": "1rem",
                    "radius-box": "0.5rem",
                    "size-selector": "0.25rem",
                    "size-field": "0.25rem",
                    border: "1px",
                    depth: "1",
                    noise: "0",
                },
            },
        ],
        darkTheme: "dark",
    },
};
