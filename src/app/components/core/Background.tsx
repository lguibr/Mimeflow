import React, { useEffect, useRef } from "react";
import p5 from "p5";

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sketch = (p: p5) => {
      let spheres: p5.Vector[] = [];
      let cameraX = 0;
      let cameraY = 0;

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        p.setAttributes("preserveDrawingBuffer", true);
        for (let i = 0; i < 1000; i++) {
          const x = p.random(-1800, 1800);
          const y = p.random(-1800, 1800);
          const z = p.random(-1800, 1800);
          const radius = p.sqrt(x * x + y * y + z * z);
          spheres.push(
            p.createVector(
              (x * 1800) / radius,
              (y * 1800) / radius,
              (z * 1800) / radius
            )
          );
        }
      };

      p.draw = () => {
        p.background("#000626ff");

        p.directionalLight(255, 255, 255, 0, 0, -1);
        p.ambientLight(50);

        p.push();
        p.translate(0, 0, 0);
        p.rotateX(cameraY);
        p.rotateY(cameraX);

        for (const sphere of spheres) {
          p.push();
          p.translate(sphere.x, sphere.y, sphere.z);
          p.fill(255);
          p.noStroke();
          p.sphere(2);
          p.pop();
        }

        p.pop();
      };

      p.mouseMoved = () => {
        cameraX = p.map(p.mouseX / 2, 0, p.width, -p.PI / 2, p.PI / 2);
        cameraY = p.map(p.mouseY / 2, 0, p.height, -p.PI / 2, p.PI / 2);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    let instance: p5;
    if (canvasRef.current) {
      instance = new p5(sketch, canvasRef.current);
    }

    return () => {
      instance?.remove();
    };
  }, []);

  return <div ref={canvasRef} style={{ position: "fixed", zIndex: -1 }} />;
};

export default Background;
