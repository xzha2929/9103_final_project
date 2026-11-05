# 9103_final_project
our final project

1. ## Project Overview

This project is an interactive p5.js reinterpretation of a sunset painting.  
We keep the main composition of the original artwork, while adding animated
clouds, a rising sun, moving grass, sound interaction and a flying bird.

The project contains three independent interactive mechanics created by
three team members.

2. ## Inspiration and Artwork Source

Our project is inspired by the painting:

- Artist: Ferdinand du Puigaudeau
- Artwork: Sunset by the Sea, Brittany
- Original source: [ADD THE ORIGINAL IMAGE LINK HERE]

We chose this artwork because its layered clouds, sunset colours, water and
foreground landscape are suitable for animation and interaction.

Our goal is not to copy every brushstroke. Instead, we reinterpret the
painting as a moving digital environment while keeping its peaceful mood.

3. ## Technical Implementation

## Perlin Noise and Randomness — Wenqiu Gu
This mechanic uses Perlin noise and seeded random values to animate the
environment.

Perlin noise creates smooth and natural movement for the clouds and grass.
Unlike completely random values, nearby Perlin noise values are similar, so
the animation does not flicker.

Random values are created once when the environment is built. They control:

- cloud starting position;
- cloud size;
- cloud opacity;
- movement phase;
- grass sway strength.

The same seed recreates the same starting variation. Pressing `R` generates
a new seed and a new visual arrangement.

Main file:
- `perlin-environment.js`

Important methods:
- `build()` — creates seeded random values;
- `update()` — updates time and smooth movement;
- `drawClouds()` — renders the different cloud layers;
- `drawSun()` — animates the rising sun;
- `drawGrass()` — creates grass movement;
- `drawMovingShadow()` — changes the foreground shadow;
- `reset()` — generates a new seeded variation.

## Audio — Shuoran Zhang

### Techniques — Audio Mechanic
The audio mechanic animates the water in the painting in response to the loudness of a music track. It uses p5.js for rendering and p5.sound for audio playback and amplitude analysis.

### Audio Analysis
A `p5.Amplitude` analyzer is connected to the music track using `setInput()`. During playback, `getLevel()` reads its amplitude. This value is multiplied by an adjustable sensitivity setting, constrained to a range of 0–1, and used to control the animation.

The response is smoothed to prevent sudden visual jumps. A faster attack allows the water to react to louder sounds, while a slower release lets the waves settle gradually when the sound becomes quieter or playback is paused.

The current version uses amplitude analysis rather than FFT or musical pitch detection.

### Water Animation

The original painting is redrawn each frame. A polygon clipping region restricts the animation to the water, approximately excluding the shoreline, seated person, rock, and house.

Inside this region, thin horizontal strips of the painting are redrawn with changing source positions. Layered sine waves create displacement, while a moving phase makes the wave pattern advance from the distant water toward the foreground.

Perspective is suggested through smaller movement near the horizon and stronger displacement closer to the viewer. Subtle traveling highlights and a faint texture sampled from the water reinforce the sense of forward flow.

Louder audio increases wave displacement and movement speed. Quieter audio reduces the effect. This is an artistic image-displacement technique rather than a physical water simulation.

### Code Organization

The audio mechanic is implemented in the separate file `audioMechanic.js`.

The `AudioRiver` class handles:

- Loading and playing the audio track.
- Starting audio through a user interaction.
- Measuring and smoothing amplitude.
- Mapping amplitude to wave strength and movement speed.
- Clipping and rendering the water animation.

The main file, `sketch.js`, loads the painting, manages the interface, and calls the mechanic's update and drawing methods.

## Perlin Noise and Randomness — Xingyi Zhang
This project is developed using HTML, JavaScript and p5.js. It is an interactive game with the background of impressionist coastal scenery. Players draw the path of the wind with the mouse, guide the bird to avoid the moving clouds, and finally return to the bird's nest safely. The project uses the following programming techniques, objects and classes, arrays and loops, mouse interaction, and animation, dynamic obstacle S and collision detection, and game states and user interface


4. ## Technical Overview

Perlin-enviroment:

This project uses p5.js image layers, Perlin noise, seeded randomness and user
interaction. The painting is separated into background, clouds, sun, grass and
foreground layers, allowing selected elements to move while the main
composition remains recognisable.

Perlin noise creates smooth movement for the clouds and grass, while
`randomSeed()` and `noiseSeed()` produce different but repeatable visual 
variations. `map()` and `lerp()` convert and smooth mouse or audio input.

Assets are loaded in `preload()`, mechanic objects are created in `setup()`,
and the animations are updated in `draw()`. Each team mechanic is stored in a
separate JavaScript file. The team decided to animate atmospheric elements
while keeping important landmarks mostly static, preserving the mood and
structure of the original artwork.

5. ## AI Acknowledgement

## Perlin-enviroment: 
AI tools were used as development support during this project.
- Tool: OpenAI ChatGPT / Codex
- Purpose: brainstorming, explaining p5.js concepts, debugging syntax and
  file-path errors, suggesting code structure, and assisting with image-layer
  preparation.
- Human contribution: team members selected the artistic concept, tested and
  adjusted the animation, chose the final visual parameters, integrated the
  mechanics and reviewed the generated suggestions.
AI-generated or AI-assisted code was reviewed, edited and tested by the team
before being included in the final project.
AI-assisted image editing was used to prepare separate transparent layers for
the clouds, sun, grass and foreground. These layers were created from the
selected reference artwork for educational use.

## Audio
Chat GPT assisted with and debugged the audio analysis, , water displacement, clipping, and interface code. The code converts smoothed audio amplitude into wave strength and movement speed. AI assistance is also acknowledged in the code comments.

## User imput
During the development process, this project used ChatGPT to check some code errors, and used AI image generation tools to assist in the production of some visual materials

6. ## External References 
- [p5.js](https://p5js.org/reference/): image rendering and animation.
- [p5.sound](https://v1.p5js.org/reference/p5.sound/): audio playback and amplitude analysis.
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D): clipping and image displacement.
- Music: “Carefree” by Kevin MacLeod, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Source](https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1400037).
- Artwork: [Add artist, title, and source].
· Images of birds: Created with the assistance of AI image generation tools; includes animated assets showing various wing positions.
· Images of clouds and bird nests: Created with the assistance of AI image generation tools.

7. ## Interaction Instructions
### Audio
Run the project using Live Server. Click **Play Audio** to start. Louder music creates stronger, faster waves. Adjust **Sensitivity** to change the visual response. Click **Pause Audio** to let the water settle.

### Perlin-enviroment: 
- **Move the mouse left or right:** control the movement of the small clouds.
- **Click the canvas:** pause or resume the environmental animation.
- **Press `R`:** generate a new seeded visual variation.
- **Automatic:** the large cloud moves across the painting and the sun slowly rises.
- **[Bird control]:** [add the final bird interaction here].
- **[Audio control]:** [add the final audio interaction here].

### User imput
-  Download and extract the complete project folder.
- Open the project folder using Visual Studio Code.
- Ensure that the `index.html` file, `sketch.js` file, and `libraries` folder remain in their original directory structure.
- Use Live Server to open `index.html` to run the game in your browser.
How To Play:
- Open the webpage, read the game instructions, and click "Start Game."
- Click on the left side of the screen to spawn a bird.
- Click and drag your mouse to draw a "wind path" leading to the bird's nest.
- Release the mouse button, and the bird will fly along the path you’ve drawn.
- Avoid the clouds that move back and forth. As you successfully rescue more birds, the clouds will move increasingly faster.
- Each bird successfully guided to the nest earns you 1 point.
- Rescue 5 birds to win the game.
- If a bird hits a cloud, the message "Oh No!" will appear, and your rescue score will reset to zero. Click "Try Again" to have another go.
- Click "Restart" to reset the game.


