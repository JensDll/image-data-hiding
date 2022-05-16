#!/bin/bash

if grep --quiet --ignore-case Microsoft /proc/version
then
  file="/mnt/c/Windows/System32/drivers/etc/hosts"
else
  file="/etc/resolv.conf"
fi

add() 
{
  echo "Writing dev hostnames to location: $file"

  cat <<HERE >> $file
192.46.238.243 dev.imagehiding.com
192.46.238.243 www.dev.imagehiding.com
192.46.238.243 api.dev.imagehiding.com
HERE
}

remove()
{
  sed -i '/192.46.238.243.*dev.imagehiding.com/d' $file
}

case $1 in
add)
  add
  ;;
remove)
  remove
  ;;
*)
  echo "Usage: $0 (add|remove)"
  ;;
esac