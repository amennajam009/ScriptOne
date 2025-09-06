import { Component } from '@angular/core';
import {
  AfterViewInit,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as THREE from 'three';
@Component({
  selector: 'app-global-earth',
  standalone: false,
  templateUrl: './global-earth.component.html',
  styleUrl: './global-earth.component.scss'
})
export class GlobalEarthComponent {
    @ViewChild('mount', { static: true }) mountRef!: ElementRef<HTMLSpanElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private earth!: THREE.Mesh;
  private clouds?: THREE.Mesh;
  private frameId?: number;
  private resizeObs?: ResizeObserver;

  // Swap these with your own assets if you prefer:
private earthTexURL = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
private specTexURL  = 'https://threejs.org/examples/textures/planets/earth_specular_2048.jpg';
private cloudTexURL = 'https://threejs.org/examples/textures/planets/earth_clouds_1024.png';


  constructor(private ngZone: NgZone) {}

  async ngAfterViewInit() {
    const mount = this.mountRef.nativeElement;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0, 1.8);

    // Lighting
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(2, 1, 1.5);
    this.scene.add(dir);

    // Geometry
    const sphere = new THREE.SphereGeometry(0.85, 64, 64);

    // Textures
    const loader = new THREE.TextureLoader();
    const [earthMap, specMap, cloudMap] = await Promise.all([
      loader.loadAsync(this.earthTexURL),
      loader.loadAsync(this.specTexURL).catch(() => null),
      loader.loadAsync(this.cloudTexURL).catch(() => null),
    ]);
    earthMap.anisotropy = 8;

    const material = new THREE.MeshStandardMaterial({
      map: earthMap,
      metalness: 0.0,
      roughness: 0.9,
      ...(specMap ? { metalnessMap: specMap } : {}),
    });

    this.earth = new THREE.Mesh(sphere, material);
    this.scene.add(this.earth);

    if (cloudMap) {
      const cloudGeo = new THREE.SphereGeometry(0.865, 64, 64);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudMap,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      });
      this.clouds = new THREE.Mesh(cloudGeo, cloudMat);
      this.scene.add(this.clouds);
    }

    // Initial size
    this.resize();

    // Keep it crisp on layout changes
    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(mount);

    // Animate outside Angular for perf
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  private animate = () => {
    this.earth.rotation.y += 0.003;
    if (this.clouds) this.clouds.rotation.y += 0.0035;
    this.renderer.render(this.scene, this.camera);
    this.frameId = requestAnimationFrame(this.animate);
  };

  private resize() {
    const mount = this.mountRef.nativeElement;
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  ngOnDestroy() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.resizeObs?.disconnect();
    this.renderer?.dispose();
    this.earth?.geometry.dispose();
    (this.earth?.material as THREE.Material)?.dispose();
    if (this.clouds) {
      this.clouds.geometry.dispose();
      (this.clouds.material as THREE.Material).dispose();
    }
  }

}
