"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as CANNON from "cannon-es";
import scss from "./About.module.scss";

interface Car {
  mesh: THREE.Group;
  body: CANNON.Body;
}

const About = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const world = new CANNON.World();
    world.gravity.set(0, -9.81, 0);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, -25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = false;
    controls.enablePan = false;

    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Audio setup
    const listener = new THREE.AudioListener();
    camera.add(listener);

    // Car engine sound
    const engineSound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      "/sounds/speed2.mp3", // Замените на свой звук двигателя
      (buffer) => {
        engineSound.setBuffer(buffer);
        engineSound.setLoop(true);
        engineSound.setVolume(1);
      }
    );

    // Background sound (например, шум ветра)
    const backgroundSound = new THREE.Audio(listener);
    audioLoader.load(
      "/sounds/mus.mp3", // Замените на свой фоновый звук
      (buffer) => {
        backgroundSound.setBuffer(buffer);
        backgroundSound.setLoop(true);
        backgroundSound.setVolume(1);
        backgroundSound.play(); // Фоновый звук начинает играть сразу
      }
    );

    // Ground
    const groundMaterial = new CANNON.Material();
    const groundBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Plane(),
      material: groundMaterial,
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMeshMaterial = new THREE.MeshStandardMaterial({
      color: 0x2e8b57,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMeshMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Detailed Asphalt Road
    const textureLoader = new THREE.TextureLoader();
    const asphaltTexture = textureLoader.load(
      "https://threejsfundamentals.org/threejs/resources/images/roughness_map.jpg"
    );
    const asphaltNormal = textureLoader.load(
      "https://threejsfundamentals.org/threejs/resources/images/heightmap.png"
    );

    asphaltTexture.wrapS = asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltNormal.wrapS = asphaltNormal.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(4, 20);
    asphaltNormal.repeat.set(4, 20);

    const roadMaterial = new CANNON.Material();
    const roadBody = new CANNON.Body({
      mass: 0,
      shape: new CANNON.Box(new CANNON.Vec3(10, 0.1, 500)),
      material: roadMaterial,
      position: new CANNON.Vec3(0, 0.05, 0),
    });
    world.addBody(roadBody);

    const roadGeometry = new THREE.PlaneGeometry(20, 1000);
    const roadMeshMaterial = new THREE.MeshStandardMaterial({
      map: asphaltTexture,
      normalMap: asphaltNormal,
      color: 0x333333,
      roughness: 0.85,
      metalness: 0.1,
      bumpMap: asphaltTexture,
      bumpScale: 0.03,
    });
    const road = new THREE.Mesh(roadGeometry, roadMeshMaterial);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.01;
    road.receiveShadow = true;
    scene.add(road);

    // Road markings
    const markingGeometry = new THREE.PlaneGeometry(0.2, 2);
    const markingMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

    for (let z = -500; z < 500; z += 5) {
      const marking = new THREE.Mesh(markingGeometry, markingMaterial);
      marking.rotation.x = -Math.PI / 2;
      marking.position.set(0, 0.06, z);
      marking.receiveShadow = true;
      scene.add(marking);
    }

    // Sidewalks
    const sidewalkGeometry = new THREE.BoxGeometry(5, 0.2, 1000);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.9,
    });

    const leftSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    leftSidewalk.position.set(-12.5, 0.15, 0);
    leftSidewalk.receiveShadow = true;
    scene.add(leftSidewalk);

    const rightSidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    rightSidewalk.position.set(12.5, 0.15, 0);
    rightSidewalk.receiveShadow = true;
    scene.add(rightSidewalk);

    // Barriers
    const barrierGeometry = new THREE.BoxGeometry(0.5, 1, 2);
    const barrierMaterial = new THREE.MeshStandardMaterial({
      color: 0xaaaaaa,
      metalness: 0.8,
      roughness: 0.4,
    });

    for (let z = -500; z < 500; z += 3) {
      const leftBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
      leftBarrier.position.set(-10.25, 0.5, z);
      leftBarrier.castShadow = true;
      scene.add(leftBarrier);

      const rightBarrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
      rightBarrier.position.set(10.25, 0.5, z);
      rightBarrier.castShadow = true;
      scene.add(rightBarrier);
    }

    // Trees and Rocks
    const treeGeometry = new THREE.CylinderGeometry(0.5, 2, 20, 8);
    const foliageGeometry = new THREE.ConeGeometry(5, 15, 8);
    const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });

    function createTree(x: number, z: number) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(treeGeometry, treeMaterial);
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = 17.5;
      trunk.position.y = 10;
      tree.add(trunk, foliage);
      tree.position.set(x, 0, z);
      tree.castShadow = true;
      return tree;
    }

    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 900 + (Math.random() > 0.5 ? 40 : -40);
      const z = (Math.random() - 0.5) * 900;
      scene.add(createTree(x, z));
    }

    const rockGeometry = new THREE.DodecahedronGeometry(2, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

    function createRock(x: number, z: number, scale: number) {
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.set(x, scale, z);
      rock.scale.set(scale, scale, scale);
      rock.castShadow = true;
      return rock;
    }

    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 900 + (Math.random() > 0.5 ? 40 : -40);
      const z = (Math.random() - 0.5) * 900;
      const scale = Math.random() * 2 + 1;
      scene.add(createRock(x, z, scale));
    }

    // Player's car
    let car: THREE.Object3D, carBody: CANNON.Body;
    const loader = new GLTFLoader();
    loader.load("/models/car/Mustang.glb", (gltf) => {
      car = gltf.scene;
      car.scale.set(3, 3, 3);
      scene.add(car);

      carBody = new CANNON.Body({
        mass: 1500,
        shape: new CANNON.Box(new CANNON.Vec3(1.5, 0.5, 3)),
        position: new CANNON.Vec3(0, 5, 0),
      });
      world.addBody(carBody);
    });

    // Other cars
    const otherCars: Car[] = [];
    for (let i = 0; i < 5; i++) {
      loader.load("/models/car/Mustang.glb", (gltf) => {
        const otherCar = gltf.scene;
        otherCar.scale.set(3, 3, 3);
        otherCar.position.set(
          (Math.random() - 0.5) * 20,
          0,
          Math.random() * 800 - 400
        );
        scene.add(otherCar);

        const otherCarBody = new CANNON.Body({
          mass: 1500,
          shape: new CANNON.Box(new CANNON.Vec3(1.5, 0.5, 3)),
          position: new CANNON.Vec3(
            otherCar.position.x,
            otherCar.position.y,
            otherCar.position.z
          ),
        });

        world.addBody(otherCarBody);
        otherCars.push({ mesh: otherCar, body: otherCarBody });
      });
    }

    interface Keys {
      KeyW: boolean;
      KeyS: boolean;
      KeyA: boolean;
      KeyD: boolean;
    }

    interface EngineSound {
      play: () => void;
      isPlaying: boolean;
    }

    // Если engineSound уже существует, не объявляем её повторно
    if (!engineSound) {
      const engineSound: EngineSound = {
        play: () => {
          /* воспроизведение звука */
        },
        isPlaying: false,
      };
    }

    const keys: Keys = { KeyW: false, KeyS: false, KeyA: false, KeyD: false };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (keys.hasOwnProperty(event.code)) {
        keys[event.code as keyof Keys] = true;
        if (event.code === "KeyW" && !engineSound.isPlaying) {
          engineSound.play();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent): void => {
      if (keys.hasOwnProperty(event.code)) {
        keys[event.code as keyof Keys] = false;
        if (event.code === "KeyW" && engineSound.isPlaying) {
          engineSound.stop();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function updateCarMovement() {
      if (!carBody) return;
      const speed = 20;
      const turnSpeed = 0.04;
      let forwardForce = 0;
      let turnForce = 0;
      if (keys.KeyW) forwardForce = speed;
      if (keys.KeyS) forwardForce = -speed;
      if (keys.KeyA) turnForce = turnSpeed;
      if (keys.KeyD) turnForce = -turnSpeed;

      const euler = new CANNON.Vec3();
      carBody.quaternion.toEuler(euler);
      const angle = euler.y;

      carBody.velocity.x = forwardForce * Math.sin(angle);
      carBody.velocity.z = forwardForce * Math.cos(angle);

      const newAngle = angle + turnForce;
      carBody.quaternion.setFromEuler(0, newAngle, 0);

      otherCars.forEach((car) => {
        const direction = Math.sign(car.body.position.z - carBody.position.z);
        car.body.velocity.z = direction * 15;
        car.mesh.position.copy(car.body.position);
        car.mesh.quaternion.copy(car.body.quaternion);
      });
    }

    const cameraOffset = new THREE.Vector3(0, 8, -15);

    function updateCamera() {
      if (!car || !carBody) return;
      const carQuaternion = carBody.quaternion;
      const offsetRotated = cameraOffset.clone().applyQuaternion(carQuaternion);
      const targetPosition = car.position.clone().add(offsetRotated);
      camera.position.lerp(targetPosition, 0.1);
      camera.lookAt(car.position);
    }

    function animate() {
      requestAnimationFrame(animate);
      world.step(1 / 60);
      updateCarMovement();
      updateCamera();

      if (car && carBody) {
        car.position.copy(carBody.position);
        car.quaternion.copy(carBody.quaternion);
      }
      renderer.render(scene, camera);
    }
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (engineSound.isPlaying) engineSound.stop();
      if (backgroundSound.isPlaying) backgroundSound.stop();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className={scss.About}>
      <div className="contain">
        <div ref={mountRef} className={scss.scene}></div>
      </div>
    </section>
  );
};
export default About;
