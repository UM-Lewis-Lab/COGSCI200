import "./style.css";
import { fabric } from "fabric";

function getRandomColor() {
    // Taken from here: https://stackoverflow.com/questions/1484506/random-color-generator
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomShapeOptions(circle: boolean = false) {
    const size = Math.round(25 + Math.random() * 75);
    return {
        left: Math.round(Math.random() * puppetCanvas.getWidth() * 0.75),
        top: Math.round(Math.random() * puppetCanvas.getHeight() * 0.75),
        fill: getRandomColor(),
        ...circle ?
            { radius: Math.round(size / 2) } :
            { height: size, width: size, angle: Math.floor(Math.random() * 360), }
    }
}

const size = Math.round(0.9 * Math.min(window.innerHeight, window.innerWidth));
const puppetCanvas = new fabric.Canvas("puppet-canvas",
    {
        height: size,
        width: size,
    }
);

let lastResize = new Date();
window.addEventListener("resize", (ev: Event) => {
    const now = new Date();
    lastResize = now;
    const size = Math.round(0.9 * Math.min(window.innerHeight, window.innerWidth));
    // Debounce the window resizing to reduce lag.
    setTimeout(() => {
        if (lastResize === now) puppetCanvas.setDimensions({ width: size, height: size });
    }, 400)
})

document.getElementById("add-rectangle-btn")?.addEventListener(
    "click", (ev: MouseEvent) => {
        const newShape = new fabric.Rect(getRandomShapeOptions());
        puppetCanvas.add(newShape)
    });
document.getElementById("add-triangle-btn")?.addEventListener(
    "click", (ev: MouseEvent) => {
        const newShape = new fabric.Triangle(getRandomShapeOptions());
        puppetCanvas.add(newShape)
    });
document.getElementById("add-circle-btn")?.addEventListener(
    "click", (ev: MouseEvent) => {
        const newShape = new fabric.Circle(getRandomShapeOptions(true));
        puppetCanvas.add(newShape)
    });
document.getElementById("add-star-btn")?.addEventListener(
    "click", (ev: MouseEvent) => {
        const newShape = new fabric.Polygon([
            { x: 50, y: 5 },
            { x: 20, y: 99 },
            { x: 95, y: 39 },
            { x: 5, y: 39 },
            { x: 80, y: 99 },
        ], getRandomShapeOptions(false));
        puppetCanvas.add(newShape);
        puppetCanvas.requestRenderAll();
    });
document.getElementById("remove-shape-btn")?.addEventListener(
    "click", (ev: MouseEvent) => {
        puppetCanvas.getActiveObjects().forEach(function (o, key) {
            puppetCanvas.remove(o);
        });
        puppetCanvas.discardActiveObject();
    });

let shadowMode: boolean = false;
const shadowImage: HTMLImageElement = document.getElementById("shadow-image")! as HTMLImageElement;
let fabricShadowImage: fabric.Image;
const shadowFilters = [
    new fabric.Image.filters.BlendColor({ color: "black", mode: "multiply" }),
    new (fabric.Image.filters as any).Blur({ blur: 0.10 }),
];
const styledElements = document.querySelectorAll([
    "#global-container",
    "#canvas-container",
    "#toggle-shadow-btn"
] as any);
const shapeButtons = document.querySelectorAll([
    "#add-rectangle-btn",
    "#add-triangle-btn",
    "#add-circle-btn",
] as any);

document.getElementById("toggle-shadow-btn")?.addEventListener(
    "click", (ev: MouseEvent) => {
        shadowMode = !shadowMode;

        puppetCanvas.discardActiveObject();

        shapeButtons.forEach(el => {
            el.disabled = shadowMode;
        });
        if (shadowMode) {
            styledElements.forEach(el => {
                el.classList.add("shadow-mode");
            })
            const overlayImageUrl = puppetCanvas.toDataURL({
                format: "png"
            });
            shadowImage.setAttribute("src", overlayImageUrl);
            fabric.Image.fromURL(overlayImageUrl, img => {
                img.setOptions({
                    selectable: false,
                    evented: false
                })
                img.applyFilters(shadowFilters);
                puppetCanvas.forEachObject(o => {
                    o.setOptions({
                        opacity: 0,
                        selectable: false,
                        evented: false,
                    });
                });
                puppetCanvas.add(img);
                fabricShadowImage = img;
            });


        } else {
            styledElements.forEach(el => {
                el.classList.remove("shadow-mode");
            })
            puppetCanvas.remove(fabricShadowImage);
            puppetCanvas.forEachObject(o => {
                o.setOptions({
                    opacity: 1,
                    selectable: true,
                    evented: true,
                })
            });
        }
        puppetCanvas.requestRenderAll();
    });
