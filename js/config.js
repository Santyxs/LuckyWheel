function Winwheel(options, drawImmediately) {

    const defaultOptions = {
        canvasId: "canvas",
        centerX: null,
        centerY: null,
        outerRadius: null,
        innerRadius: 0,
        numSegments: 1,
        drawMode: "code",
        rotationAngle: 0,
        textFontFamily: "Arial",
        textFontSize: 20,
        textFontWeight: "bold",
        textOrientation: "horizontal",
        textAlignment: "center",
        textDirection: "normal",
        textMargin: null,
        textFillStyle: "black",
        textStrokeStyle: null,
        textLineWidth: 1,
        fillStyle: "silver",
        strokeStyle: "black",
        lineWidth: 1,
        clearTheCanvas: true,
        imageOverlay: false,
        drawText: true,
        pointerAngle: 0,
        wheelImage: null,
        imageDirection: "N",
        responsive: false,
        scaleFactor: 1
    };

    Winwheel.prototype.startAnimation = function () {
        // Contar segmentos válidos con texto no vacío (ignorando índice 0)
        const validSegmentCount = this.segments
            ? this.segments.reduce((count, seg, index) => {
                if (index > 0 && seg && seg.text && seg.text.trim() !== "") return count + 1;
                return count;
            }, 0)
            : 0;

        if (validSegmentCount < 2) {
            console.error("⚠ No se puede girar la ruleta: se requieren al menos 2 nombres.");
            alert("⚠ No se puede girar la ruleta: se requieren al menos 2 nombres.");
            return;
        }

        if (this.animation) {
            const ruletaSound = new Audio("assets/ruleta.mp3");
            ruletaSound.play().catch(error => console.error("⚠ Error al reproducir el sonido:", error));

            this.animation.startTime = Date.now();
            this.animation.spinning = true;
            this.animation.velocity = Math.random() * 10 + 40;
            this.animation.friction = Math.random() * 0.01 + 0.985;
            this.animation.finalFriction = Math.random() * 0.005 + 0.990;
            this.animation.slowingDown = false;
            this.animation.minVelocity = Math.random() * 0.2 + 0.1;
            this.animation.stopOffset = Math.random() * 30 - 15;
            requestAnimationFrame(this.animationLoop.bind(this));
        } else {
            console.error("⚠ La animación no está configurada.");
        }
    };

    Winwheel.prototype.animationLoop = function () {
        if (this.animation.spinning) {
            this.rotationAngle += this.animation.velocity;

            // Cuando la velocidad baja de cierto umbral, aplicamos la fricción final
            if (this.animation.velocity < 15) {
                this.animation.friction = this.animation.finalFriction;
            }

            // Aplicamos fricción progresiva
            this.animation.velocity *= this.animation.friction;

            // Si la velocidad es muy baja, aplicamos la parada aleatoria
            if (this.animation.velocity < this.animation.minVelocity) {
                this.animation.velocity *= 0.98;
                if (this.animation.velocity < 0.05) { // Se detiene suavemente
                    this.animation.spinning = false;
                    this.rotationAngle = (Math.round(this.rotationAngle) + this.animation.stopOffset) % 360; // Parada aleatoria
                    if (this.animation.callbackFinished) {
                        this.animation.callbackFinished();
                    }
                    return;
                }
            }

            this.draw(); // Redibujar la rueda
            requestAnimationFrame(this.animationLoop.bind(this));
        }
    };


    // Asignar opciones personalizadas o usar las predeterminadas
    for (let key in defaultOptions) {
        this[key] = options && options[key] !== undefined ? options[key] : defaultOptions[key];
    }

    // Asignar propiedades adicionales que no están en las opciones predeterminadas
    if (options) {
        for (let key in options) {
            if (this[key] === undefined) {
                this[key] = options[key];
            }
        }
    }

    // Configurar el canvas y el contexto de dibujo
    if (this.canvasId) {
        this.canvas = document.getElementById(this.canvasId);
        if (this.canvas) {
            this.ctx = this.canvas.getContext("2d");
            this.centerX = this.centerX ?? this.canvas.width / 2;
            this.centerY = this.centerY ?? this.canvas.height / 2;
            this.outerRadius = this.outerRadius ?? (this.canvas.width < this.canvas.height ? this.canvas.width / 2 - this.lineWidth : this.canvas.height / 2 - this.lineWidth);
        } else {
            this.canvas = null;
            this.ctx = null;
        }
    } else {
        this.canvas = null;
        this.ctx = null;
    }

    // Inicializar segmentos
    this.segments = [null]; // El índice 0 no se usa
    for (let i = 1; i <= this.numSegments; i++) {
        this.segments[i] = new Segment(options?.segments?.[i - 1]);
    }

    // Actualizar tamaños de segmentos y configuraciones adicionales
    this.updateSegmentSizes();
    this.textMargin = this.textMargin ?? this.textFontSize / 1.7;

    // Configurar animación y pines si se proporcionan
    this.animation = options?.animation ? new Animation(options.animation) : new Animation();
    this.pins = options?.pins ? new Pin(options.pins) : undefined;

    // Configurar el modo de dibujo (imagen o segmentos)
    if (this.drawMode === "image" || this.drawMode === "segmentImage") {
        this.fillStyle = options?.fillStyle ?? null;
        this.strokeStyle = options?.strokeStyle ?? "red";
        this.drawText = options?.drawText ?? false;
        this.lineWidth = options?.lineWidth ?? 1;
        drawImmediately = drawImmediately ?? false;
    } else {
        drawImmediately = drawImmediately ?? true;
    }

    // Configurar la guía del puntero
    this.pointerGuide = options?.pointerGuide ? new PointerGuide(options.pointerGuide) : new PointerGuide();

    // Configurar responsividad
    if (this.responsive) {
        this._originalCanvasWidth = this.canvas.width;
        this._originalCanvasHeight = this.canvas.height;
        this._responsiveScaleHeight = this.canvas.dataset.responsivescaleheight;
        this._responsiveMinWidth = this.canvas.dataset.responsiveminwidth;
        this._responsiveMinHeight = this.canvas.dataset.responsiveminheight;
        this._responsiveMargin = this.canvas.dataset.responsivemargin;
        window.addEventListener("load", winwheelResize);
        window.addEventListener("resize", winwheelResize);
    }

    // Dibujar la rueda si es necesario
    if (drawImmediately) {
        this.draw(this.clearTheCanvas);
    } else if (this.drawMode === "segmentImage") {
        winwheelToDrawDuringAnimation = this;
        winhweelAlreadyDrawn = false;
        for (let i = 1; i <= this.numSegments; i++) {
            if (this.segments[i].image) {
                this.segments[i].imgData = new Image();
                this.segments[i].imgData.onload = winwheelLoadedImage;
                this.segments[i].imgData.src = this.segments[i].image;
            }
        }
    }
}

// Clase para representar los pines de la rueda
function Pin(options) {
    const defaultOptions = {
        visible: true,
        number: 36,
        outerRadius: 3,
        fillStyle: "grey",
        strokeStyle: "black",
        lineWidth: 1,
        margin: 3,
        responsive: false
    };

    // Asignar opciones personalizadas o usar las predeterminadas
    for (let key in defaultOptions) {
        this[key] = options && options[key] !== undefined ? options[key] : defaultOptions[key];
    }

    // Asignar propiedades adicionales
    if (options) {
        for (let key in options) {
            if (this[key] === undefined) {
                this[key] = options[key];
            }
        }
    }
}

// Clase para gestionar la animación de la rueda
function Animation(options) {
    const defaultOptions = {
        type: "spinOngoing",
        direction: "clockwise",
        propertyName: null,
        propertyValue: null,
        duration: 10,
        yoyo: false,
        repeat: null,
        easing: null,
        stopAngle: null,
        spins: null,
        clearTheCanvas: null,
        callbackFinished: null,
        callbackBefore: null,
        callbackAfter: null,
        callbackSound: null,
        soundTrigger: "segment"
    };

    // Asignar opciones personalizadas o usar las predeterminadas
    for (let key in defaultOptions) {
        this[key] = options && options[key] !== undefined ? options[key] : defaultOptions[key];
    }

    // Asignar propiedades adicionales
    if (options) {
        for (let key in options) {
            if (this[key] === undefined) {
                this[key] = options[key];
            }
        }
    }
}

// Clase para representar los segmentos de la rueda
function Segment(options) {
    const defaultOptions = {
        size: null,
        text: "",
        fillStyle: null,
        strokeStyle: null,
        lineWidth: null,
        textFontFamily: null,
        textFontSize: null,
        textFontWeight: null,
        textOrientation: null,
        textAlignment: null,
        textDirection: null,
        textMargin: null,
        textFillStyle: null,
        textStrokeStyle: null,
        textLineWidth: null,
        image: null,
        imageDirection: null,
        imgData: null
    };

    // Asignar opciones personalizadas o usar las predeterminadas
    for (let key in defaultOptions) {
        this[key] = options && options[key] !== undefined ? options[key] : defaultOptions[key];
    }

    // Asignar propiedades adicionales
    if (options) {
        for (let key in options) {
            if (this[key] === undefined) {
                this[key] = options[key];
            }
        }
    }

    // Inicializar ángulos del segmento
    this.startAngle = 0;
    this.endAngle = 0;
}

// Clase para la guía del puntero
function PointerGuide(options) {
    const defaultOptions = {
        display: false,
        strokeStyle: "red",
        lineWidth: 3
    };

    // Asignar opciones personalizadas o usar las predeterminadas
    for (let key in defaultOptions) {
        this[key] = options && options[key] !== undefined ? options[key] : defaultOptions[key];
    }
}

// Métodos del prototipo de Winwheel
Winwheel.prototype.updateSegmentSizes = function () {
    if (this.segments) {
        let totalSize = 0;
        let segmentsWithSize = 0;

        for (let i = 1; i <= this.numSegments; i++) {
            if (this.segments[i].size !== null) {
                totalSize += this.segments[i].size;
                segmentsWithSize++;
            }
        }

        const remainingSize = 360 - totalSize;
        const defaultSize = remainingSize / (this.numSegments - segmentsWithSize);

        let startAngle = 0;
        for (let i = 1; i <= this.numSegments; i++) {
            this.segments[i].startAngle = startAngle;
            this.segments[i].size = this.segments[i].size ?? defaultSize;
            startAngle += this.segments[i].size;
            this.segments[i].endAngle = startAngle;
        }
    }
};

Winwheel.prototype.clearCanvas = function () {
    if (this.ctx) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

Winwheel.prototype.draw = function (clearCanvas) {
    if (this.ctx) {
        if (clearCanvas !== false) {
            this.clearCanvas();
        }

        if (this.drawMode === "image") {
            this.drawWheelImage();
            if (this.drawText) this.drawSegmentText();
            if (this.imageOverlay) this.drawSegments();
        } else if (this.drawMode === "segmentImage") {
            this.drawSegmentImages();
            if (this.drawText) this.drawSegmentText();
            if (this.imageOverlay) this.drawSegments();
        } else {
            this.drawSegments();
            if (this.drawText) this.drawSegmentText();
        }

        if (this.pins && this.pins.visible) {
            this.drawPins();
        }

        if (this.pointerGuide.display) {
            this.drawPointerGuide();
        }
    }
};

// Métodos de dibujo
Winwheel.prototype.drawSegments = function () {
    if (this.ctx && this.segments) {
        const centerX = this.centerX * this.scaleFactor;
        const centerY = this.centerY * this.scaleFactor;
        const innerRadius = this.innerRadius * this.scaleFactor;
        const outerRadius = this.outerRadius * this.scaleFactor;

        for (let i = 1; i <= this.numSegments; i++) {
            const segment = this.segments[i];
            const fillStyle = segment.fillStyle ?? this.fillStyle;
            const strokeStyle = segment.strokeStyle ?? this.strokeStyle;
            const lineWidth = segment.lineWidth ?? this.lineWidth;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, outerRadius, this.degToRad(segment.startAngle + this.rotationAngle - 90), this.degToRad(segment.endAngle + this.rotationAngle - 90));
            this.ctx.lineTo(centerX, centerY);

            if (fillStyle) {
                this.ctx.fillStyle = fillStyle;
                this.ctx.fill();
            }

            if (strokeStyle) {
                this.ctx.strokeStyle = strokeStyle;
                this.ctx.lineWidth = lineWidth;
                this.ctx.stroke();
            }
        }
    }
};

Winwheel.prototype.drawPins = function () {
    if (this.pins && this.pins.number && this.ctx) {
        const centerX = this.centerX * this.scaleFactor;
        const centerY = this.centerY * this.scaleFactor;
        const outerRadius = this.outerRadius * this.scaleFactor;
        const pinRadius = this.pins.outerRadius * (this.pins.responsive ? this.scaleFactor : 1);
        const pinMargin = this.pins.margin * (this.pins.responsive ? this.scaleFactor : 1);

        const angleStep = 360 / this.pins.number;

        for (let i = 0; i < this.pins.number; i++) {
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(this.degToRad(i * angleStep + this.rotationAngle));
            this.ctx.translate(-centerX, -centerY);

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY - outerRadius + pinMargin + pinRadius, pinRadius, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.pins.fillStyle;
            this.ctx.fill();
            this.ctx.strokeStyle = this.pins.strokeStyle;
            this.ctx.lineWidth = this.pins.lineWidth;
            this.ctx.stroke();

            this.ctx.restore();
        }
    }
};

Winwheel.prototype.drawPointerGuide = function () {
    if (this.ctx && this.pointerGuide.display) {
        const centerX = this.centerX * this.scaleFactor;
        const centerY = this.centerY * this.scaleFactor;
        const outerRadius = this.outerRadius * this.scaleFactor;

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(this.degToRad(this.pointerAngle));
        this.ctx.translate(-centerX, -centerY);

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX, centerY - outerRadius / 4);
        this.ctx.strokeStyle = this.pointerGuide.strokeStyle;
        this.ctx.lineWidth = this.pointerGuide.lineWidth;
        this.ctx.stroke();

        this.ctx.restore();
    }
};

Winwheel.prototype.degToRad = function (degrees) {
    return degrees * (Math.PI / 180);
};


Winwheel.prototype.drawSegmentText = function () {

    if (!this.ctx) return; // Si no hay contexto, salir de la función

    const centerX = this.centerX * this.scaleFactor;
    const centerY = this.centerY * this.scaleFactor;
    const outerRadius = this.outerRadius * this.scaleFactor;
    const innerRadius = this.innerRadius * this.scaleFactor;

    for (let segmentIndex = 1; segmentIndex <= this.numSegments; segmentIndex++) {
        this.ctx.save(); // Guardar el estado del contexto

        const segment = this.segments[segmentIndex];
        if (!segment.text) continue; // Si no hay texto, continuar con el siguiente segmento

        // Obtener las propiedades de estilo del texto
        const textFontFamily = segment.textFontFamily || this.textFontFamily;
        const textFontSize = (segment.textFontSize || this.textFontSize) * this.scaleFactor;
        const textFontWeight = segment.textFontWeight || this.textFontWeight;
        const textOrientation = segment.textOrientation || this.textOrientation;
        const textAlignment = segment.textAlignment || this.textAlignment;
        const textDirection = segment.textDirection || this.textDirection;
        const textMargin = (segment.textMargin || this.textMargin) * this.scaleFactor;
        const textFillStyle = segment.textFillStyle || this.textFillStyle;
        const textStrokeStyle = segment.textStrokeStyle || this.textStrokeStyle;
        const textLineWidth = segment.textLineWidth || this.textLineWidth;

        // Configurar el estilo del texto
        this.ctx.font = `${textFontWeight || ''} ${textFontSize}px ${textFontFamily}`;
        this.ctx.fillStyle = textFillStyle;
        this.ctx.strokeStyle = textStrokeStyle;
        this.ctx.lineWidth = textLineWidth;

        // Dividir el texto en líneas (si hay saltos de línea)
        const textLines = segment.text.split("\n");
        const lineHeight = textFontSize;
        const verticalOffset = -lineHeight * (textLines.length / 2) + lineHeight / 2;

        // Dibujar cada línea de texto
        textLines.forEach((line, lineIndex) => {
            const currentVerticalOffset = verticalOffset + lineIndex * lineHeight;

            if (textDirection === "reversed") {
                this.drawReversedText(line, segment, centerX, centerY, innerRadius, outerRadius, textMargin, currentVerticalOffset, textOrientation, textAlignment);
            } else {
                this.drawNormalText(line, segment, centerX, centerY, innerRadius, outerRadius, textMargin, currentVerticalOffset, textOrientation, textAlignment);
            }
        });

        this.ctx.restore(); // Restaurar el estado del contexto
    }
};

// Método para dibujar texto en orientación normal
Winwheel.prototype.drawNormalText = function (text, segment, centerX, centerY, innerRadius, outerRadius, textMargin, verticalOffset, textOrientation, textAlignment) {
    const angle = this.degToRad(segment.endAngle - (segment.endAngle - segment.startAngle) / 2 + this.rotationAngle - 90);

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.ctx.translate(-centerX, -centerY);

    let x, y;
    switch (textAlignment) {
        case "inner":
            x = centerX + innerRadius + textMargin;
            y = centerY + verticalOffset;
            break;
        case "outer":
            x = centerX + outerRadius - textMargin;
            y = centerY + verticalOffset;
            break;
        default: // "center"
            x = centerX + innerRadius + (outerRadius - innerRadius) / 2 + textMargin;
            y = centerY + verticalOffset;
            break;
    }

    this.ctx.textAlign = textAlignment === "inner" ? "left" : textAlignment === "outer" ? "right" : "center";
    this.ctx.textBaseline = "middle";

    if (this.ctx.fillStyle) this.ctx.fillText(text, x, y);
    if (this.ctx.strokeStyle) this.ctx.strokeText(text, x, y);

    this.ctx.restore();
};

// Método para dibujar texto en orientación invertida
Winwheel.prototype.drawReversedText = function (text, segment, centerX, centerY, innerRadius, outerRadius, textMargin, verticalOffset, textOrientation, textAlignment) {
    const angle = this.degToRad(segment.endAngle - (segment.endAngle - segment.startAngle) / 2 + this.rotationAngle - 90 - 180);

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);
    this.ctx.translate(-centerX, -centerY);

    let x, y;
    switch (textAlignment) {
        case "inner":
            x = centerX - innerRadius - textMargin;
            y = centerY + verticalOffset;
            break;
        case "outer":
            x = centerX - outerRadius + textMargin;
            y = centerY + verticalOffset;
            break;
        default: // "center"
            x = centerX - innerRadius - (outerRadius - innerRadius) / 2 - textMargin;
            y = centerY + verticalOffset;
            break;
    }

    this.ctx.textAlign = textAlignment === "inner" ? "right" : textAlignment === "outer" ? "left" : "center";
    this.ctx.textBaseline = "middle";

    if (this.ctx.fillStyle) this.ctx.fillText(text, x, y);
    if (this.ctx.strokeStyle) this.ctx.strokeText(text, x, y);

    this.ctx.restore();
};