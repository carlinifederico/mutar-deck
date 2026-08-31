# Créditos de los modelos 3D

Los objetos del interludio del carrete (`deck/models/`) son **CC0** de
[Poly Haven](https://polyhaven.com). CC0 es dominio público: no exige
atribución. Esta lista existe igual, para dejar registro de la procedencia y
para poder rastrear cualquier modelo si hace falta reemplazarlo.

Los archivos que están acá **no** son los originales: pasaron por
`tools/build-scans.mjs` (decimados a ~3.5k triángulos, texturas a 512px WebP,
materiales marcados como unlit, mallas cuantizadas). El pipeline y el porqué de
cada paso están en el README.

| archivo | qué es | original | tris | peso |
| --- | --- | --- | ---: | ---: |
| `obj-01.glb` | sillon victoriano | [ArmChair_01](https://polyhaven.com/a/ArmChair_01) | 3499 | 80 KB |
| `obj-02.glb` | sofa vintage | [sofa_03](https://polyhaven.com/a/sofa_03) | 3499 | 74 KB |
| `obj-03.glb` | sofa de madera gastado | [painted_wooden_sofa](https://polyhaven.com/a/painted_wooden_sofa) | 3500 | 80 KB |
| `obj-04.glb` | mecedora | [Rockingchair_01](https://polyhaven.com/a/Rockingchair_01) | 3500 | 87 KB |
| `obj-05.glb` | divan | [vintage_day_bed](https://polyhaven.com/a/vintage_day_bed) | 2715 | 82 KB |
| `obj-06.glb` | pupitre | [SchoolDesk_01](https://polyhaven.com/a/SchoolDesk_01) | 3500 | 61 KB |
| `obj-07.glb` | mesa chica | [WoodenTable_02](https://polyhaven.com/a/WoodenTable_02) | 1514 | 44 KB |
| `obj-08.glb` | aparador | [vintage_cabinet_01](https://polyhaven.com/a/vintage_cabinet_01) | 3511 | 119 KB |
| `obj-09.glb` | estanteria | [Shelf_01](https://polyhaven.com/a/Shelf_01) | 182 | 26 KB |
| `obj-10.glb` | tv de tubo | [television_02](https://polyhaven.com/a/television_02) | 2310 | 52 KB |
| `obj-11.glb` | tv de madera | [Television_01](https://polyhaven.com/a/Television_01) | 1918 | 56 KB |
| `obj-12.glb` | equipo de musica | [boombox](https://polyhaven.com/a/boombox) | 3542 | 134 KB |
| `obj-13.glb` | walkman | [cassette_player](https://polyhaven.com/a/cassette_player) | 3496 | 83 KB |
| `obj-14.glb` | proyector 8mm | [filmstrip_projector_8mm](https://polyhaven.com/a/filmstrip_projector_8mm) | 3945 | 145 KB |
| `obj-15.glb` | radio | [vintage_radio_transceiver](https://polyhaven.com/a/vintage_radio_transceiver) | 10869 | 347 KB |
| `obj-16.glb` | microondas retro | [vintage_microwave](https://polyhaven.com/a/vintage_microwave) | 3498 | 71 KB |
| `obj-17.glb` | caja registradora | [CashRegister_01](https://polyhaven.com/a/CashRegister_01) | 3503 | 123 KB |
| `obj-18.glb` | reloj de pie | [vintage_grandfather_clock_01](https://polyhaven.com/a/vintage_grandfather_clock_01) | 3500 | 106 KB |
| `obj-19.glb` | valija | [vintage_suitcase](https://polyhaven.com/a/vintage_suitcase) | 3498 | 58 KB |
| `obj-20.glb` | camara antigua | [Camera_01](https://polyhaven.com/a/Camera_01) | 3523 | 127 KB |

**20 objetos · 1954 KB en total.**

## Qué no se pudo conseguir

Del pedido original faltan cuatro objetos que no existen en el catálogo CC0 de
descarga directa. Se reemplazaron por equivalentes de la misma familia:

| pedido | qué hay en su lugar |
| --- | --- |
| máquina de escribir | caja registradora (misma silueta: teclas y carro) |
| máquina de coser | proyector de 8mm |
| piano | reloj de pie (el otro mueble de madera alto y macizo) |
| reposera | mecedora y diván |

Si aparecen los originales, se agregan a `tools/scans.json` y se vuelve a
correr el pipeline: `scan.js` los toma del manifest sin tocar código.

## three.js

`deck/js/vendor/three-bundle.js` es un bundle parcial de
[three.js](https://threejs.org) (licencia MIT), generado por
`tools/build-three.mjs`. No editar a mano.
