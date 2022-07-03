const THREE = require("three"); // importujemy bibliotekę three

// importujemy klasę orbit controls z three js która posłuży do pracy kamery
const OrbitControls = require("three-orbitcontrols"); 


const cubeSize = 25; // stała z rozmiarem szcześcianów
const cubeColor = "black"; // stała z kolorem sześcianów
const edgesColor = "gray"; // stała z kolorem krawędzi sześcianów


const scene = new THREE.Scene(); // tworzymy nową scenę 
scene.background = new THREE.Color("white"); // ustawiamy białe tło dla sceny

// tworzymy obiekt kamery
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 20, 150); // ustalamy pozycję kamery

// tworzymy obiekt renderer który wyswietli scenę wraz z włącząnym wygładzaniem krawędzi
const renderer = new THREE.WebGLRenderer({antialias: true}); 

// Tworzymy obiekt controls z klasy OrbitControls 
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();  // Aktualizujemy pracę kamery. 

// ustawiamy szerokosc i wysokosc wyswietlacza na wymiary okna nieco pomniejszone
renderer.setSize(window.innerWidth - 300, window.innerHeight - 150); 
document.getElementById('animation').appendChild(renderer.domElement); // Obsadzamy w elemencie div wyswietlacz

let cords = [-25, 0, 25]; // 3 możliwe współrzędne jakie będą posiadać szesciany (x, y, z)

let positions = []; // tablica która będzie się składać z obiektami zawierającymi każdą możliwą 
                    // kombinacje współrzędnych x, y, z


// Potrójnie zagnieżdżona pętla for ma za zadanie stworzenie 27 obiektów o każdej możliwej współrzędnej
// i umieszczenie ich w tablicy positions
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    for (let k = 0; k < 3; k++) {
      positions.push({
        x: cords[i],
        y: cords[j],
        z: cords[k],
      });
    }
  }
}

let cubeGeometries = []; // tablica w której będziemy trzymać geometrie szczescianów.
                        // Posłużą one nam też jako baza dla krawędzi sześcianów

// Tworzymy nową tablicę iterując na tablicy positions. Będzie ona posiadała obiekty oteksturowanych sześcianów
const cubes = positions.map((pos) => {
  const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize); // tworzymy geometrię sześcianu
  cubeGeometries.push(geometry); // wkładamy geometrie sześcianu do tablicy cubeGeometries
  const material = new THREE.MeshBasicMaterial({ color: cubeColor}); // Tworzymy testurę o czarnym kolorze
  const cube = new THREE.Mesh(geometry, material); // Tworzymy sześcian na podstawie utworzonej geometrii i tekstury
  // nadajemy sześcianowi współrzędne z iterowanego obiektu tablicy positions
  cube.position.x = pos.x;
  cube.position.y = pos.y;
  cube.position.z = pos.z;
  // obiekt sześcianu zwracamy do tablicy cubes
  return cube; 
});

// Tworzymy tablice lines która będzie zawierała obiekty krąwędzi każdego z sześcianu.
// Iterujemy na tablicy cubeGeometries.
const lines = cubeGeometries.map((geometry, i) => {
  const edges = new THREE.EdgesGeometry(geometry); // Tworzymy geometrie krawędzi
  //                                                 na podstawie iterowanej geometrii sześcianu

  // Tworzymy krawędzie na podstawie w.w. geometrii oraz tekstury w kolorze szarym
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: edgesColor})
  );

  // nadajemy krawędziom współrzędne posługując sie indexem i i odnosząć sie do tablicy positions 
  line.position.x = positions[i].x;
  line.position.y = positions[i].y;
  line.position.z = positions[i].z;

  return line; // zwracamy obiekt krawędzi jako element tablicy lines
});

scene.add(...cubes, ...lines); // dodajemy do sceny wytworzone obiekty sześcianów oraz krawędzi


const treshold = 100; // próg (klatek) do którego sześciany będą się rozsuwały

let current = 0;  // zmienna która będzie się zmieniała o 1 w każdej klatce
                  // Od niej będzie zależąło czy sześciany się rozczepiają czy łączą.

let flow = "out"; // Kierunek przesuwania się sześcianów

function animate() {
  if (current == 0) {  // Jeśli current jest 0, ustawiamy kierunek na "out" czyli przemieszczanie się 
                      // sześcianów na zewnątrz
    flow = "out";
  } else if (current == treshold) {
    flow = "in";      // Jeśli current dojdzie do progu, wtedy ustawiamy przemieszczanie się sześcianów
                      // do wewnątrz
  }

  // Jeśli zmienna flow ma wartość "out"  współrzedne sześcianów oraz 
  // współrzędne krawędzi są pomnażana przez 1.01
  // oraz current jest zwiększane o 1. W przeciwnym wypadku 
  // współrzędne są dzielone przez 1.01 oraz current zmniejszany o 1.
  if (flow == "out") {
    cubes.forEach((cube) => {
      cube.position.x = cube.position.x * 1.01;
      cube.position.y = cube.position.y * 1.01;
      cube.position.z = cube.position.z * 1.01;
    });
    lines.forEach((line) => {
      line.position.x = line.position.x * 1.01;
      line.position.y = line.position.y * 1.01;
      line.position.z = line.position.z * 1.01;
    });
    current++;
  } else {
    cubes.forEach((cube) => {
      cube.position.x = cube.position.x / 1.01;
      cube.position.y = cube.position.y / 1.01;
      cube.position.z = cube.position.z / 1.01;
    });
    lines.forEach((line) => {
      line.position.x = line.position.x / 1.01;
      line.position.y = line.position.y / 1.01;
      line.position.z = line.position.z / 1.01;
    });
    current--;
  }

  requestAnimationFrame(animate); // Wywoływujemy kolejne wywołanie funkcji animate
  controls.update();  // aktualizujemy pracę kamery
  renderer.render(scene, camera); // renderujemy klatkę
}


animate(); // Po załadowaniu się strony, wywoływujemy funckję odpowiadająca za animacje
