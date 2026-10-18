# joshuaanrico.github.io

Source for my portfolio at **https://joshuaanrico.github.io**.

Plain HTML, CSS and JavaScript. No build step: GitHub Pages serves the files as they are.

```
index.html            the page
404.html              shown for any unknown URL
css/style.css         all styles, light and dark theme
js/main.js            theme toggle, mobile menu, nav highlight, galleries, copy email
favicon.svg
Joshua-Anrico-CV.pdf  linked from "Download CV"
img/                  gallery slides (1680 x 1080 WebP)
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```
npx serve .
```

## Updating

- **CV:** replace `Joshua-Anrico-CV.pdf`, keep the same file name.
- **Screenshots:** put them in `img/` and add a `<div class="slide" data-caption="...">` with the `<img>` inside a project's `.slides`. Arrows and dots appear by themselves at 2 or more slides. Demo data only.
