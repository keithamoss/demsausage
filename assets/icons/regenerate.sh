#!/bin/bash

clean_tmp_dir () {
  rm -rf tmp
  mkdir -p tmp/
}

VER="$1"

if [ x"$VER" = x ]; then
    echo "set a version!"
    exit 1
fi

# Create native resolution sprites
clean_tmp_dir
sprite_dir_name=sprite_v"$VER"

rm -rf $sprite_dir_name
cp -R png $sprite_dir_name

glue $sprite_dir_name tmp --crop --margin=1 --json
mv tmp/"$sprite_dir_name".json ../../public/src/icons/"$sprite_dir_name".json
mv tmp/"$sprite_dir_name".png ../../public/public/icons/"$sprite_dir_name".png


# Create 0.5 resolution sprites
clean_tmp_dir
sprite05_dir_name=sprite@0.5_v"$VER"

rm -rf $sprite05_dir_name
cp -R png $sprite05_dir_name
cd $sprite05_dir_name
mogrify -resize 50% *.png

cd ../
# glue $sprite05_dir_name tmp --crop --margin=1 --css
glue $sprite05_dir_name tmp --crop --margin=1 --css --sprite-namespace=sprite_05 --namespace=
mv tmp/"$sprite05_dir_name".css ../../public/public/icons/"$sprite05_dir_name".css
mv tmp/"$sprite05_dir_name".png ../../public/public/icons/"$sprite05_dir_name".png

rm -rf $sprite_dir_name
rm -rf $sprite05_dir_name
rm -rf tmp