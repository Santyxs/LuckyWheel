document.addEventListener("DOMContentLoaded", () => {
    const collapsibleButton = document.querySelector(".collapsible-button");
    const content = document.querySelector(".content");
    const form = document.querySelector(".js-form");
    const nameInput = document.querySelector(".js-name-input");
    const nameList = document.querySelector(".js-name-list");

    let namesArray = []; // Almacena los nombres actuales

    // Mostrar/Ocultar la lista al hacer clic en el botón
    collapsibleButton.addEventListener("click", () => {
        content.style.display = content.style.display === "block" ? "none" : "block";
    });

    // Cargar los nombres desde la ruleta al iniciar
    function loadInitialNames() {
        if (typeof theWheel !== "undefined" && theWheel.segments) {
            nameList.innerHTML = ""; // Limpiar la lista antes de cargar los nombres
            namesArray = [];

            theWheel.segments.forEach((segment, index) => {
                if (index > 0 && segment.text) {
                    namesArray.push(segment.text);
                    addNameToList(segment.text, false);
                }
            });
        } else {
            console.error("⚠ No se pudo cargar theWheel. Asegúrate de que la ruleta está inicializada.");
        }
    }

    // Agregar un nombre a la lista y opcionalmente a la ruleta
    function addNameToList(name, addToWheel = true) {
        const li = document.createElement("li");
        li.innerHTML = `<span>${name}</span> <button class="delete-button">X</button>`;
        nameList.appendChild(li);

        if (addToWheel) {
            namesArray.push(name);
            updateWheel();
        }
    }

    // Actualizar la ruleta cuando la lista de nombres cambia
    function updateWheel() {
        theWheel = new Winwheel({
            'numSegments': namesArray.length,
            'outerRadius': 400,
            'textFontSize': 50,
            'segments': namesArray.map(name => ({
                'fillStyle': getRandomColor(),
                'text': name
            })),
        });

        theWheel.draw();
    }

    // Manejar el envío del formulario para agregar nombres
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        if (name && !namesArray.includes(name)) {
            addNameToList(name);
            nameInput.value = "";
        }
    });

    // Eliminar un nombre de la lista y actualizar la ruleta
    nameList.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-button")) {
            const name = e.target.parentElement.querySelector("span").textContent;
            namesArray = namesArray.filter(n => n !== name);
            e.target.parentElement.remove();
            updateWheel();
        }
    });

    // Cargar los nombres automáticamente al inicializar la ruleta
    setTimeout(loadInitialNames, 500);

    // Generar colores aleatorios para los nuevos segmentos de la ruleta
    function getRandomColor() {
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
    }
});
