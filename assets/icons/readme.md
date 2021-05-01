# Icon sizes

DPI: 96

BBQ: 64x64
Cake: 80x73 (64x64 w/o additional icon)
Sausage and Cake: 80x69
Red Cross of Shame: 64x64
Unknown: 32x32
Vego: 64x64
Coffee: 64x64
Bacon and Eggs: 64x64
Halal: 64x64
Tick: 64x64
Plus: 64x64
Run Out: 64x64

# Getting setup

Install [https://glue.readthedocs.io/en/latest/](Glue) and [https://www.imagemagick.org/](ImageMagick).

```
pip3 install glue
brew update
brew install imagemagick
```

# Changing an existing icon or adding a new icon

1. Grab the icon as an SVG file
2. Run it through Jake Archibald's [SVGOMG - SVGO's Missing GUI] (https://jakearchibald.github.io/svgomg/) with all settings on default
3. Drop the resulting file in `assets/icons/icon.svg`
4. Open the SVG in Affinity Designer, set the DPI to 96, ensure the dimensions at the appropriate size (usually 512x512px), and save it into `assets/icons/afdesign-files/icon.afdesign`
5. Export a PNG from Affinity Designer at the appropriate size (usually 64x64px) and save it into `assets/icons/png/icon.png`
6. Update the icon sizes documentation at the top of this file
7. Run `assets/icons/regenerate.sh` to recreate the spritesheets
8. Delete the second to last set of spritesheets
9. Replace the <svg> element in `public/src/icons/icon.tsx` and `admin/src/icons/icon.tsx`
10. Update `AboutPage.tsx` with a link to the icon and credit for the artist

And you're good!

Note: We keep the previous spritesheet around until next time we regenerate the sprites just in case users have them cached.
