import * as THREE from 'three'
import Experience from './Experience.js'
import vertexShader from './Shaders/sphere/vertex.glsl'
import fragmentShader from './Shaders/sphere/fragment.glsl'

export default class Sphere {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.debug = this.experience.debug
    this.time = this.experience.time
    this.timeFrequency = 0.0001

    if (this.debug) {
      this.debugFolder = this.debug.addFolder({
        title: 'Sphere',
        expanded: true,
      })
    }

    this.setLights()
    this.setMaterial()
    this.setGeometry()
    this.setMesh()
  }

  setLights() {
    this.lights = {}

    // Light A
    this.lights.a = {}

    this.lights.a.intensity = 1.85

    this.lights.a.color = {}
    this.lights.a.color.value = '#ff0000'
    this.lights.a.color.instance = new THREE.Color(this.lights.a.color.value)

    this.lights.a.spherical = new THREE.Spherical(1, 0.615, 2.049)

    // Light B
    this.lights.b = {}

    this.lights.b.intensity = 1.4

    this.lights.b.color = {}
    this.lights.b.color.value = '#3158ff'
    this.lights.b.color.instance = new THREE.Color(this.lights.b.color.value)

    this.lights.b.spherical = new THREE.Spherical(1, 2.561, - 1.844)

    // Debug
    if (this.debug) {
      for (const _lightName in this.lights) {
        const light = this.lights[_lightName]

        const debugFolder = this.debugFolder.addFolder({
          title: `Light ${_lightName}`,
          expanded: true
        })

        debugFolder
          .addInput(
            light.color,
            'value',
            { view: 'color', label: 'color' }
          )
          .on('change', () => {
            light.color.instance.set(light.color.value)
          })

        debugFolder
          .addInput(
            light,
            'intensity',
            { min: 0, max: 10 }
          )
          .on('change', () => {
            this.material.uniforms[`uLight${_lightName.toUpperCase()}Intensity`].value = light.intensity
          })

        debugFolder
          .addInput(
            light.spherical,
            'phi',
            { label: 'phi', min: 0, max: Math.PI, step: 0.001 }
          )
          .on('change', () => {
            this.material.uniforms[`uLight${_lightName.toUpperCase()}Position`].value.setFromSpherical(light.spherical)
          })

        debugFolder
          .addInput(
            light.spherical,
            'theta',
            { label: 'theta', min: - Math.PI, max: Math.PI, step: 0.001 }
          )
          .on('change', () => {
            this.material.uniforms.uLightAPosition.value.setFromSpherical(light.spherical)
          })
      }
    }
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(1, 512, 512)
    this.geometry.computeTangents()
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDistortionFrequency: { value: 2 },
        uDistortionStrength: { value: 1.5 },
        uDisplacementFrequency: { value: 2 },
        uDisplacementStrength: { value: 0.2 },

        uLightAColor: { value: this.lights.a.color.instance },
        uLightAPosition: { value: new THREE.Vector3(1.0, 1.0, 0.0) },
        uLightAIntensity: { value: this.lights.a.intensity },

        uLightBColor: { value: this.lights.b.color.instance},
        uLightBPosition: { value: new THREE.Vector3(-1.0, -1.0, 0.0) },
        uLightBIntensity: { value: this.lights.b.intensity },

        uBaseColor: { value: new THREE.Color('#000000') },
      },
      defines: {
        USE_TANGENT: '',
      }
    })

    this.material.uniforms.uLightAPosition.value.setFromSpherical(this.lights.a.spherical)
    this.material.uniforms.uLightBPosition.value.setFromSpherical(this.lights.b.spherical)

    if (this.debug) {
      this.debugFolder.addInput(this, 'timeFrequency', {
        min: 0,
        max: 0.001,
        step: 0.000001,
      })
      this.debugFolder.addInput(this.material.uniforms.uDistortionFrequency, 'value', {
        label: 'uDistortionFrequency',
        min: 0,
        max: 10,
        step: 0.001,
      })
      this.debugFolder.addInput(this.material.uniforms.uLightAPosition.value, 'x', {
        label: 'uLightAPositionX',
        min: -2,
        max: 2,
        step: 0.001,
      })
      this.debugFolder.addInput(this.material.uniforms.uLightAPosition.value, 'y', {
        label: 'uLightAPositionY',
        min: -2,
        max: 2,
        step: 0.001,
      })
      this.debugFolder.addInput(this.material.uniforms.uLightAPosition.value, 'z', {
        label: 'uLightAPositionZ',
        min: -2,
        max: 2,
        step: 0.001,
      })
      this.debugFolder.addInput(this.material.uniforms.uDistortionStrength, 'value', {
        label: 'uDistortionStrength',
        min: 0,
        max: 10,
        step: 0.001,
      })
      this.debugFolder.addInput(this.material.uniforms.uDisplacementFrequency, 'value', {
        label: 'uDisplacementFrequency',
        min: 0,
        max: 5,
        step: 0.001,
      })
      this.debugFolder.addInput(this.material.uniforms.uDisplacementStrength, 'value', {
        label: 'uDisplacementStrength',
        min: 0,
        max: 1,
        step: 0.001,
      })
    }
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  update() {
    this.material.uniforms.uTime.value += this.time.delta * this.timeFrequency
  }
}