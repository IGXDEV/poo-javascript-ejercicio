/**
 * SISTEMA AVANZADO DE FIGURAS GEOMÉTRICAS
 * Conceptos: Herencia Multinivel, Polimorfismo, Encapsulamiento, Validaciones
 * Patrones: Singleton, Builder
 */


// 1. CLASES BASE Y VALIDACIONES 

class FiguraGeometrica {
    #id; // Propiedad privadad

    constructor(nombre) {
        this.nombre = nombre;
        this.#id = Math.random().toString(36).substr(2, 9);
        if (this.constructor === FiguraGeometrica) {
            throw new Error ("No se puede instanciar una clase abstracta");
        }
    }

    get id() { return this.#id; }

    //Método de utilidad para validación 
    validarPositivo(valor, nombreCampo) {
        if (typeof valor !== 'number' || valor <=0){
            throw new Error(`El campo '${nombreCampo}' debe ser un número mayor a 0.`);
        }
    }


// Metodos abstractos 
calcularArea() {   throw new Error('No implementado'); }
//Nueva funcionalidad: Similitud (mismo tipo y área similar con 10% tolerancia)
esSimilar(otraFigura) {
    if (this.constructor.name !== otraFigura.constructor.name) return false;
    const ratio = this.calcularArea() / otraFigura.calcularArea();
    return ratio >= 0.9 && ratio <= 1.1; 
}

describir() {
    return `[${this.constructor.name}] ID:${this.id}`;
  }
}
// Subclase intermedia para separar dimensiones
class Figura2D extends FiguraGeometrica {
  calcularPerimetro() { throw new Error('No implementado'); }
  
  dibujarASCII() { return "Figura genérica 2D"; } // Nuevo requerimiento
}

class Figura3D extends FiguraGeometrica {
    calcularVolumen() { throw new Error('No implmentado'); }
}

//  2. Figuras 2D (Se agregaron nuevas)

class Circulo extends Figura2D {
    constructor(radio) {
        super('Circulo');
        this.validarPositivo(radio, 'radio');
        this.radio = radio;
    }
calcularArea() { return Math.PI * this.radio ** 2; }
calcularPerimetro() { return 2 * Math.PI * this.radio; }

dibujarASCII() {
    return this.radio < 2 ? " o " : " 0 "; // Representacion Simple
  }
}

class Rectangulo extends Figura2D {
  constructor(ancho, alto) {
    super('Rectángulo');
    this.validarPositivo(ancho, 'ancho');
    this.validarPositivo(alto, 'alto');
    this.ancho = ancho;
    this.alto = alto;
  }

  calcularArea() { return this.ancho * this.alto; }
  calcularPerimetro() { return 2 * (this.ancho + this.alto); }
  
  dibujarASCII() {
    // Dibujo dinámico básico
    let dibujo = "";
    const w = Math.min(this.ancho, 10); // Limitamos para no saturar consola
    const h = Math.min(this.alto, 5);
    for(let i=0; i<h; i++) {
      dibujo += "*".repeat(w) + "\n";
    }
    return dibujo;
  }
}

//      NUEVAS FIGURAS 

class PentagonoRegular extends Figura2D {
    constructor(lado, apotema) {
        super('Pentágono');
        this.validarPositivo(lado, 'lado');
        this.validarPositivo(apotema, 'apotema');
        this.lado = lado;
        this.apotema = apotema;
    }

    calcularArea () { return (this.calcularPerimetro() * this.apotema) / 2; }
    calcularPerimetro() { return this.lado * 5; }

    dibujarASCII() {
        return "  /\\\n /  \\\n|____|"; // Arte ASCII simple
    }
}
class HexagonoRegular extends Figura2D {
    constructor(lado) {
        super('Hexágono');
        this.validarPositivo(lado, 'lado');
        this.lado = lado;
    }

    calcularArea() { return ((3 * Math.sqrt(3)) /2) * this.lado ** 2;}
    calcularPerimetro() { return this.lado * 6; }

    dibujarASCII() {
        return " _\n/ \\\n\\_/";
    }
}


// Figuras 3D 

class Cubo extends Figura3D {
    constructor(lado) {
        super ('Cubo');
        this.validarPositivo(lado, 'lado');
        this.lado = lado;
    }

    calcularArea() { return 6 * (this.lado ** 2); } // Area superficial
    calcularVolumen() { return this.lado ** 3; }
    
    describir() {
        return `${super.describir()} - Volumen: ${this.calcularVolumen().toFixed(2)}`;
    }
}


//  Patrones de diseño

/**
 * Patron singleton
 * Garantiza que solo exista una instancia del gestor de la coleccion.
 * util para controlar el estado global de la aplicacion
 */
class GestorFiguras {
    static instance; // Propiedad estática para guardar la instancia única

    constructor() {
        if (GestorFiguras.instance) {
            return GestorFiguras.instance;
        }
        this.figuras = [];
        GestorFiguras.instance = this;
    }

    agregar(figura) {
        if (figura instanceof FiguraGeometrica) {
            this.figuras.push(figura);
            console.log(`[Gestor] Agregado: ${figura.nombre} (${figura.id})`);
        }
    }

    mostrarReporte() {
        console.log('\n--- REPORTE DE FIGURAS ---');
        this.figuras.forEach(f => {
            console.log(f.describir());
            if (f instanceof Figura2D) {
                console.log(`Dibujo:\n${f.dibujarASCII()}`);
            }
        });
        console.log('----------------------------');
    }
}

/**
 * patron builder
 * separa la construcción de un objeto complejo de su representación.
 * permite crea figuras paso a paso sin constructures gigantes.
 */

class FiguraBuilder {
    constructor(tipo) {
        this.tipo = tipo;
        this.dimensiones = {};
    }

    setRadio(r) { this.dimensiones.radio =r; return this; }
    setLado(l) { this.dimensiones.lado = l; return this; }
    setAncho(w) { this.dimensiones.ancho = w; return this; }
    setAlto(h) { this.dimensiones.alto = h; return this; }
    setApotema(a) {this.dimensiones.apotema = a; return this; }

    build() {
        switch(this.tipo.toLowerCase()) {
            case 'circulo':
                return new Circulo(this.dimensiones.radio);
            case 'rectangulo':
                return new Rectangulo(this.dimensiones.ancho, this.dimensiones.alto);
            case 'pentagono':
                return new PentagonoRegular(this.dimensiones.lado, this.dimensiones.apotema);
            case 'cubo':
                return new Cubo(this.dimensiones.lado);
            default:
                throw new Error("Builder: Tipo desconocido");
        }
    }
}

// Pruebas 

// 1- Instancia Singleton
const gestor = new GestorFiguras();
// const gestorFake = new GestorFiguras(); // Esto Devolveria la misma instancia anterior

try {
    console.log(' Iniciando Sistema ');

    // 2- Creación Manual con validaciones
    const hex = new HexagonoRegular(10);
    gestor.agregar(hex);

    // 3- Creación usando Builder (Patron de diseño)
    const miPentagono = new FiguraBuilder('pentagono')
       .setLado(6)
       .setApotema(4)
       .build();
    gestor.agregar(miPentagono);

    const miCubo = new FiguraBuilder('cubo')
      .setLado(3)
      .build();
    gestor.agregar(miCubo);

    const rect1 = new FiguraBuilder('rectangulo')
      .setAncho(10)
      .setAlto(5)
      .build();
    gestor.agregar(rect1);

    // 4- Validación de Errores (descomentar para usar)
    // const eerrorFig = new Circulo(-5);

    // 5- Funcionalidad de Similitud
    const rect2 = new Rectangulo(10.1, 4.9); // casi igual a rect1
    console.log(`\n¿Es rect1 similar a rect2? ${rect1.esSimilar(rect2) ? 'SÍ' : 'NO'}`);
    console.log(`¿Es rect1 similar al cubo? ${rect1.esSimilar(miCubo) ? 'SÍ' : 'NO'}`);

    // 6- Reporte Final con ASCII y polimorfismo
    gestor.mostrarReporte();

} catch (error) {
    console.error(`❌ ERROR DEL SISTEMA: ${error.message}`);

}



