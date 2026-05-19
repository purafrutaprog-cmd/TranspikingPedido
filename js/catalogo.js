/* ========= EMPRESA (FIJA) ========= */
const EMPRESA = {
  nombre: "Transpiking W.P. Global, S.L",
  direccion: "CL san sebatian 62 ENT 1",
  cp: "08030 Barcelona",
  cif: "B22613558"
};

/* ========= IVA  ========= */
const IVA_PCT = 10;

/* ========= PROMO HELADOS =========
   Si total helados (sumando todos los helados) >= 100:
   cada helado se cobra a 0.95 €
*/
const HELADOS_UMBRAL = 100;
const HELADOS_PRECIO_PROMO = 0.95;

/* ========= CATÁLOGO FIJO (NO EDITABLE DESDE LA APP) ========= */
const CATALOGO = [
  { 
	id:"P1",
	tipo:"Helados", 
	nombre:"Coco Fresa", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P2", 
	tipo:"Helados", 
	nombre:"Coco Piña", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P3", 
	tipo:"Helados", 
	nombre:"Coco", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P4", 
	tipo:"Helados", 
	nombre:"Fresa", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P5", 
	tipo:"Helados", 
	nombre:"Maracuya", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P6", 
	tipo:"Helados", 
	nombre:"Piña", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P7", 
	tipo:"Helados", 
	nombre:"Mango", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P8", 
	tipo:"Helados", 
	nombre:"Lulo", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P9", 
	tipo:"Helados", 
	nombre:"Mora", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P10", 
	tipo:"Helados", 
	nombre:"Tutifruti", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P11", 
	tipo:"Helados", 
	nombre:"Guayaba", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P12", 
	tipo:"Helados", 
	nombre:"Guanabana", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P13", 
	tipo:"Helados", 
	nombre:"Queso", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P14", 
	tipo:"Helados", 
	nombre:"Dulce de leche", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P15", 
	tipo:"Helados", 
	nombre:"Tamarindo", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P16", 
	tipo:"Helados", 
	nombre:"Chocolate", 
	precio:1.00,
	stock: 1000 
  },
  { 
	id:"P17", 
	tipo:"Helados", 
	nombre:"Mango Verde", 
	precio:1.00,
	stock: 1000 
  },
  { 
	id:"P18", 
	tipo:"Helados", 
	nombre:"Lucuma", 
	precio:1.00,
	stock: 1000 
  },

  { 
	id:"P19", 
	tipo:"Arepas", 
	nombre:"Arepa Blanca (La Victoria)", 
	precio:1.80,
	stock: 100 
  },
  { 
	id:"P20", 
	tipo:"Arepas", 
	nombre:"Arepa Maiz Amarillo (La Victoria)", 
	precio:1.80,
	stock: 100 
  },
  { 
	id:"P21", 
	tipo:"Arepas", 
	nombre:"Arepa Queso (La Victoria)", 
	precio:3.30,
	stock: 100 
  },
  { 
	id:"P22", 
	tipo:"Arepas", 
	nombre:"Arepa de Choclo (La Victoria)", 
	precio:3.50,
	stock: 100 
  },
  { 
	id:"P23", 
	tipo:"Arepas", 
	nombre:"Arepa de Yuca con queso (La Victoria)", 
	precio:3.50,
	stock: 100 
  },

  { 
	id:"P24", 
	tipo:"Embutidos", 
	nombre:"Salami Especial Dominicano 1KG (Iduveca)", 
	precio:8.95,
	stock: 100 
  },
  { 
	id:"P25", 
	tipo:"Embutidos", 
	nombre:"Salami Especial Dominicano 500GR (Indiveca)", 
	precio:4.85,
	stock: 100 
  },
  { 
	id:"P26", 
	tipo:"Embutidos", 
	nombre:"Chorizo Colombiano 500GR (La Victoria)", 
	precio:4.80,
	stock: 100 
  },

  { 
	id:"P27", 
	tipo:"Lacteos", 
	nombre:"Queso Fresco Latino 300GR", 
	precio:2.65,
	stock: 100 
  },
  { 
	id:"P28", 
	tipo:"Lacteos", 
	nombre:"Queso Fresco Latino 800GR", 
	precio:6.60,
	stock: 100 
  },
  { 
	id:"P29", 
	tipo:"Arepas", 
	nombre:"Arepas de Maiz con Queso (SEJOA)", 
	precio:3.50,
	stock: 100 
  },

  { 
	id:"P30", 
	tipo:"Embutidos", 
	nombre:"Chorizo Cervezero Ecuatoriano", 
	precio:4.95,
	stock: 100 
 },
  { 
	id:"P31", 
	tipo:"Embutidos", 
	nombre:"Salchicha Huachana", 
	precio:4.95,
	stock: 100 
  },

  { 
	id:"P32", 
	tipo:"Bebidas", 
	nombre:"Chicha Morada 1L", 
	precio:4.70,
	stock: 100 
  },
  { 
	id:"P33", 
	tipo:"Lacteos", 
	nombre:"Nata-Mantequilla Centroamericana 450GR", 
	precio:4.60,
	stock: 100 
  },

  { 
	id:"P34", 
	tipo:"Helados", 
	nombre:"Maní", 
	precio:1.00,
	stock: 1000
  },
  { 
	id:"P35", 
	tipo:"Embutidos", 
	nombre:"Salami Especial Dominicano 500GR (Iduveca)x24und", 
	precio:116.40,
	stock: 100 
  },
  { 
	id:"P36", 
	tipo:"Lacteos", 
	nombre:"Nata-Mantequilla Centroamericana 450GR x12und", 
	precio:55.20,
	stock: 100 
  },
];
