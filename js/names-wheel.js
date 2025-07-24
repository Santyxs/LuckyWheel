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