document.addEventListener("DOMContentLoaded", () => {
    const settingsBtn = document.getElementById("settingsBtn");
    const themeSettingsModal = document.getElementById("themeSettingsModal");
    const closeModal = document.querySelector(".close");
    const themeModeSelect = document.getElementById("themeMode");
    const solidColorOptions = document.getElementById("solidColorOptions");
    const presetOptions = document.getElementById("presetOptions");
    const colorPicker = document.getElementById("colorPicker");
    const presetColors = document.querySelectorAll(".preset-color");
    const presetGrid = document.querySelector(".preset-grid");

    // Открытие модального окна
    settingsBtn.addEventListener("click", () => {
        themeSettingsModal.style.display = "flex";
    });

    // Закрытие модального окна
    closeModal.addEventListener("click", () => {
        themeSettingsModal.style.display = "none";
    });

    // Изменение режима темы
    themeModeSelect.addEventListener("change", (event) => {
        const mode = event.target.value;
        solidColorOptions.style.display = mode === "solid" ? "block" : "none";
        presetOptions.style.display = mode === "preset" ? "block" : "none";
    });

    // Выбор цвета из предустановленных
    presetColors.forEach(color => {
        color.addEventListener("click", () => {
            const selectedColor = color.getAttribute("data-color");
            document.body.style.background = selectedColor;
            colorPicker.value = selectedColor;
            localStorage.setItem("theme", JSON.stringify({ mode: "solid", color: selectedColor }));
        });
    });

    // Выбор пользовательского цвета
    colorPicker.addEventListener("input", (event) => {
        const color = event.target.value;
        document.body.style.background = color;
        localStorage.setItem("theme", JSON.stringify({ mode: "solid", color }));
    });

    // Выбор обоев
    presetGrid.addEventListener("click", (event) => {
        if (event.target.classList.contains("preset")) {
            const bg = event.target.getAttribute("data-bg");
            document.body.style.backgroundImage = bg;
            localStorage.setItem("theme", JSON.stringify({ mode: "preset", bg }));
        }
    });

    // Загрузка сохраненной темы
    function loadTheme() {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            const theme = JSON.parse(savedTheme);
            if (theme.mode === "solid") {
                document.body.style.background = theme.color;
                colorPicker.value = theme.color;
            } else if (theme.mode === "preset") {
                document.body.style.backgroundImage = theme.bg;
            }
        }
    }

    loadTheme();
});