let theWheel;

function initializeWheel() {
    console.log("Inicializando la ruleta...");

    theWheel = new Winwheel({
        'numSegments': 11,
        'outerRadius': 400,
        'textFontSize': 50,
        'animation': {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 8
        },
        'segments': [
            { fillStyle: '#ff0000', text: 'Paco' },
            { fillStyle: '#00ff00', text: 'Manolo' },
            { fillStyle: '#0000ff', text: 'Pablo' },
            { fillStyle: '#ffff00', text: 'Cristina' },
            { fillStyle: '#ff00ff', text: 'Yolanda' },
            { fillStyle: '#00ffff', text: 'Jonathan' },
            { fillStyle: '#ff8000', text: 'Sara' },
            { fillStyle: '#8000ff', text: 'Marcos' },
            { fillStyle: '#0080ff', text: 'Pancracio' },
            { fillStyle: '#ff0080', text: 'Juan' },
            { fillStyle: '#80ff00', text: 'Laura' }
        ]
    });

    console.log("Ruleta inicializada correctamente:", theWheel);
}

// Iniciar el giro de la ruleta
function startSpin() {
    if (theWheel) {
        theWheel.startAnimation();
    } else {
        console.error("⚠ Error: la ruleta no está inicializada.");
    }
}

// Inicializar la ruleta cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeWheel);
