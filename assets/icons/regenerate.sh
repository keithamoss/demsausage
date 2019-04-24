#!/bin/bash

clean_tmp_dir () {
  rm -rf tmp
  mkdir -p tmp/
}

# Create native resolution sprites
clean_tmp_dir
sprite_dir_name=sprite

rm -rf $sprite_dir_name
cp -R png/ $sprite_dir_name

glue $sprite_dir_name tmp --cachebuster-filename --margin=1 --json
mv tmp/sprite.json ../../public/src/icons/sprite.json
mv tmp/*.png ../../public/public/icons/


# Create 0.5 resolution sprites
clean_tmp_dir
sprite05_dir_name=sprite@0.5

rm -rf $sprite05_dir_name
cp -R png/ $sprite05_dir_name
cd $sprite05_dir_name
mogrify -resize 50% *.png

cd ../
glue sprite@0.5 tmp --cachebuster-filename --crop --margin=1 --css --sprite-namespace=sprite_05 --namespace=
mv tmp/*.css ../../public/public/icons/sprite@0.5.css
mv tmp/*.png ../../public/public/icons/

rm -rf $sprite_dir_name
rm -rf $sprite05_dir_name
rm -rf tmp